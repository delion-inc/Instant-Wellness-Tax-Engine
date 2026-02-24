package com.example.server.repository.native_query;

import com.example.server.dto.order.OrderCsvRow;
import com.example.server.enums.OrderStatus;
import com.example.server.util.OrderCsvParser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Repository
@RequiredArgsConstructor
public class OrderNativeRepository {

    private static final int BATCH_SIZE = 500;

    private static final String INSERT_SQL =
            "INSERT INTO orders (external_id, latitude, longitude, timestamp, subtotal, status, csv_imported, created_by, created_at, updated_at) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, now(), now())";

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
}
