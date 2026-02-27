package com.example.server.repository.native_query;

import com.example.server.dto.order.ImportableRow;
import com.example.server.dto.order.OrderCsvRow;
import com.example.server.enums.OrderStatus;
import com.example.server.util.OrderCsvParser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Repository
@RequiredArgsConstructor
public class OrderNativeRepository {

    private static final int BATCH_SIZE = 500;

    private static final String INSERT_SQL =
            "INSERT INTO orders (external_id, latitude, longitude, timestamp, subtotal, status, csv_imported, created_by, created_at, updated_at) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, now(), now())";

    private static final String UPDATE_SQL =
            "UPDATE orders SET latitude = ?, longitude = ?, timestamp = ?, subtotal = ?, " +
            "status = '" + OrderStatus.ADDED.name() + "', updated_at = now() " +
            "WHERE external_id = ?";

    private final JdbcTemplate jdbcTemplate;
    private final OrderCsvParser csvParser;

    @Transactional
    public int batchInsert(List<OrderCsvRow> rows, Long userId) {
        int total = 0;
        for (int i = 0; i < rows.size(); i += BATCH_SIZE) {
            List<OrderCsvRow> chunk = rows.subList(i, Math.min(i + BATCH_SIZE, rows.size()));
            jdbcTemplate.batchUpdate(INSERT_SQL, chunk, chunk.size(), (ps, row) -> {
                Long extId = csvParser.parseExternalId(row.getId());
                if (extId != null) ps.setLong(1, extId); else ps.setNull(1, java.sql.Types.BIGINT);
                ps.setBigDecimal(2, csvParser.parseBigDecimal(row.getLatitude(), "latitude"));
                ps.setBigDecimal(3, csvParser.parseBigDecimal(row.getLongitude(), "longitude"));
                ps.setLong(4, csvParser.parseTimestamp(row.getTimestamp()));
                ps.setBigDecimal(5, csvParser.parseBigDecimal(row.getSubtotal(), "subtotal"));
                ps.setString(6, OrderStatus.ADDED.name());
                ps.setBoolean(7, true);
                ps.setLong(8, userId);
            });
            total += chunk.size();
            log.info("CSV batch insert: {}/{}", total, rows.size());
        }
        return total;
    }

    @Transactional
    public int batchInsertRows(List<ImportableRow> rows, Long userId) {
        int total = 0;
        for (int i = 0; i < rows.size(); i += BATCH_SIZE) {
            List<ImportableRow> chunk = rows.subList(i, Math.min(i + BATCH_SIZE, rows.size()));
            jdbcTemplate.batchUpdate(INSERT_SQL, chunk, chunk.size(), (ps, row) -> {
                if (row.getExternalId() != null) ps.setLong(1, row.getExternalId());
                else ps.setNull(1, java.sql.Types.BIGINT);
                ps.setBigDecimal(2, row.getLatitude());
                ps.setBigDecimal(3, row.getLongitude());
                ps.setLong(4, row.getTimestamp());
                ps.setBigDecimal(5, row.getSubtotal());
                ps.setString(6, OrderStatus.ADDED.name());
                ps.setBoolean(7, true);
                ps.setLong(8, userId);
            });
            total += chunk.size();
        }
        log.info("CSV batch insert (with handling): {} rows", total);
        return total;
    }

    @Transactional
    public int batchOverwriteRows(List<ImportableRow> rows) {
        int total = 0;
        for (int i = 0; i < rows.size(); i += BATCH_SIZE) {
            List<ImportableRow> chunk = rows.subList(i, Math.min(i + BATCH_SIZE, rows.size()));
            int[][] counts = jdbcTemplate.batchUpdate(UPDATE_SQL, chunk, chunk.size(), (ps, row) -> {
                ps.setBigDecimal(1, row.getLatitude());
                ps.setBigDecimal(2, row.getLongitude());
                ps.setLong(3, row.getTimestamp());
                ps.setBigDecimal(4, row.getSubtotal());
                ps.setLong(5, row.getExternalId());
            });
            for (int[] batch : counts) for (int c : batch) total += c;
        }
        log.info("CSV batch overwrite: {} rows updated", total);
        return total;
    }

    public Set<Long> getExistingExternalIds(List<Long> externalIds) {
        if (externalIds.isEmpty()) return new HashSet<>();
        String placeholders = String.join(",", externalIds.stream().map(id -> "?").toList());
        String sql = "SELECT DISTINCT external_id FROM orders WHERE external_id IN (" + placeholders + ")";
        List<Long> found = jdbcTemplate.queryForList(sql, Long.class, externalIds.toArray());
        return new HashSet<>(found);
    }

    public List<Long> findOutOfScopeExternalIds(List<Long> externalIds) {
        if (externalIds.isEmpty()) return List.of();
        String placeholders = String.join(",", externalIds.stream().map(id -> "?").toList());
        String sql = "SELECT DISTINCT external_id FROM orders WHERE status = 'OUT_OF_SCOPE' " +
                     "AND external_id IN (" + placeholders + ")";
        return jdbcTemplate.queryForList(sql, Long.class, externalIds.toArray());
    }
}
