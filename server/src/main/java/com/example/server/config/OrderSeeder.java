package com.example.server.config;

import com.example.server.repository.TaxCalculationNativeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Slf4j
@Component
@Order(3)
@RequiredArgsConstructor
public class OrderSeeder implements ApplicationRunner {

    private static final int BATCH_SIZE               = 500;
    private static final int NY_COUNT                 = 12_178;
    private static final int OOS_COUNT                = 500;
    private static final int ADDED_PENDING_COUNT      = 1_500;
    private static final int FAILED_VALIDATION_COUNT  = 1_500;

    private static final double[][] NY_ZONES = {
        {40.700, 40.880, -74.020, -73.907},
        {40.570, 40.740, -74.050, -73.833},
        {40.540, 40.800, -73.960, -73.700},
        {40.790, 40.915, -73.935, -73.747},
        {40.490, 40.650, -74.260, -74.035},
        {40.600, 40.780, -73.700, -73.420},
        {40.600, 41.100, -73.420, -71.860},
        {40.900, 41.360, -73.970, -73.480},
        {41.100, 41.600, -74.500, -74.000},
        {41.500, 42.000, -73.800, -73.500},
        {41.200, 41.800, -74.300, -73.500},
        {42.400, 42.900, -74.200, -73.600},
        {42.800, 43.200, -76.300, -75.900},
        {43.000, 43.300, -77.700, -77.200},
        {42.500, 43.100, -79.200, -78.400},
        {43.800, 44.800, -75.500, -73.700},
        {42.000, 42.500, -77.500, -75.600},
        {43.000, 43.500, -75.500, -75.000},
        {43.100, 43.400, -76.500, -76.000},
        {44.000, 44.600, -76.200, -75.700},
    };

    private static final double[][] OOS_ZONES = {
        {40.500, 41.400, -75.600, -74.100},
        {38.900, 40.500, -75.600, -73.900},
        {41.000, 42.100, -73.750, -71.800},
        {39.700, 42.000, -80.500, -75.100},
        {42.700, 45.000, -73.450, -71.500},
    };

    private static final double[] SUBTOTAL_PRESETS = {
        25.0, 45.0, 50.0, 75.0, 100.0, 120.0, 150.0, 200.0, 250.0, 500.0
    };

    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwordEncoder;
    private final TaxCalculationNativeRepository taxCalculationRepo;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM orders", Integer.class);
        if (count != null && count > 0) {
            log.info("Orders already seeded ({} records), skipping.", count);
            return;
        }

        log.info("Starting order seed ({} NY + {} OOS + {} ADDED + {} FAILED_VALIDATION)...",
                NY_COUNT, OOS_COUNT, ADDED_PENDING_COUNT, FAILED_VALIDATION_COUNT);

        Long userId = getOrCreateSeedUser();
        Random rng  = new Random(42L);

        int nyInserted = insertNyOrders(rng, userId);
        log.info("  [1/4] NY records inserted: {}", nyInserted);

        int oosInserted = insertOosOrders(rng, userId);
        log.info("  [2/4] Out-of-scope records inserted: {}", oosInserted);

        log.info("  [3/4] Running tax calculation on {} ADDED records...", nyInserted + oosInserted);
        taxCalculationRepo.calculatePendingOrders();

        int addedInserted = insertAddedPending(rng, userId);
        log.info("  [4a/4] ADDED pending records inserted: {}", addedInserted);

        int fvInserted = insertFailedValidation(rng, userId);
        log.info("  [4b/4] FAILED_VALIDATION records inserted: {}", fvInserted);

        logDistribution();
    }

    private int insertNyOrders(Random rng, Long userId) {
        long tsStart = tsMillis(2024, 1, 1);
        long tsRange = tsMillis(2026, 1, 1) - tsStart;

        List<Object[]> rows = new ArrayList<>(NY_COUNT);
        for (int i = 0; i < NY_COUNT; i++) {
            double[] z = NY_ZONES[rng.nextInt(NY_ZONES.length)];
            rows.add(row(
                    z[0] + rng.nextDouble() * (z[1] - z[0]),
                    z[2] + rng.nextDouble() * (z[3] - z[2]),
                    tsStart + (long) (rng.nextDouble() * tsRange),
                    randomSubtotal(rng),
                    "ADDED", false, userId, null
            ));
        }
        return batchInsert(rows);
    }

    private int insertOosOrders(Random rng, Long userId) {
        long tsStart = tsMillis(2024, 1, 1);
        long tsRange = tsMillis(2026, 1, 1) - tsStart;

        List<Object[]> rows = new ArrayList<>(OOS_COUNT);
        for (int i = 0; i < OOS_COUNT; i++) {
            double[] z = OOS_ZONES[rng.nextInt(OOS_ZONES.length)];
            rows.add(row(
                    z[0] + rng.nextDouble() * (z[1] - z[0]),
                    z[2] + rng.nextDouble() * (z[3] - z[2]),
                    tsStart + (long) (rng.nextDouble() * tsRange),
                    randomSubtotal(rng),
                    "ADDED", false, userId, null
            ));
        }
        return batchInsert(rows);
    }

    private int insertAddedPending(Random rng, Long userId) {
        long tsStart = tsMillis(2025, 6, 1);
        long tsRange = tsMillis(2026, 3, 1) - tsStart;

        List<Object[]> rows = new ArrayList<>(ADDED_PENDING_COUNT);
        for (int i = 0; i < ADDED_PENDING_COUNT; i++) {
            double[] z = NY_ZONES[rng.nextInt(NY_ZONES.length)];
            rows.add(row(
                    z[0] + rng.nextDouble() * (z[1] - z[0]),
                    z[2] + rng.nextDouble() * (z[3] - z[2]),
                    tsStart + (long) (rng.nextDouble() * tsRange),
                    randomSubtotal(rng),
                    "ADDED", false, userId, null
            ));
        }
        return batchInsert(rows);
    }

    private int insertFailedValidation(Random rng, Long userId) {
        long tsStart = tsMillis(2024, 1, 1);
        long tsRange = tsMillis(2026, 1, 1) - tsStart;

        double[][] badCoords = {
            {0.0,   0.0  },
            {999.0, 999.0},
            {-90.0, 180.0},
            {40.7,  -74.0},
            {91.0,  -74.0},
        };

        List<Object[]> rows = new ArrayList<>(FAILED_VALIDATION_COUNT);
        for (int i = 0; i < FAILED_VALIDATION_COUNT; i++) {
            int    pattern = i % badCoords.length;
            double lat     = badCoords[pattern][0];
            double lon     = badCoords[pattern][1];
            BigDecimal sub = (pattern == 3)
                    ? BigDecimal.valueOf(-(rng.nextDouble() * 499 + 1)).setScale(4, RoundingMode.HALF_UP)
                    : randomSubtotal(rng);
            rows.add(row(lat, lon,
                    tsStart + (long) (rng.nextDouble() * tsRange),
                    sub, "FAILED_VALIDATION", false, userId, (long) (200_000 + i)));
        }
        return batchInsert(rows);
    }

    private Object[] row(double lat, double lon, long ts, BigDecimal sub,
                         String status, boolean csvImported, Long userId, Long extId) {
        return new Object[]{
            BigDecimal.valueOf(lat).setScale(7, RoundingMode.HALF_UP),
            BigDecimal.valueOf(lon).setScale(7, RoundingMode.HALF_UP),
            ts, sub, status, csvImported, userId, extId
        };
    }

    private int batchInsert(List<Object[]> rows) {
        if (rows.isEmpty()) return 0;
        String sql = """
                INSERT INTO orders
                    (latitude, longitude, timestamp, subtotal, status,
                     csv_imported, created_by, external_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, now(), now())
                """;
        for (int i = 0; i < rows.size(); i += BATCH_SIZE) {
            jdbc.batchUpdate(sql, rows.subList(i, Math.min(i + BATCH_SIZE, rows.size())));
        }
        return rows.size();
    }

    private BigDecimal randomSubtotal(Random rng) {
        if (rng.nextDouble() < 0.70) {
            return BigDecimal.valueOf(SUBTOTAL_PRESETS[rng.nextInt(SUBTOTAL_PRESETS.length)])
                             .setScale(4, RoundingMode.HALF_UP);
        }
        double raw = 5.0 + rng.nextDouble() * rng.nextDouble() * 995.0;
        return BigDecimal.valueOf(raw).setScale(4, RoundingMode.HALF_UP);
    }

    private static long tsMillis(int year, int month, int day) {
        return LocalDate.of(year, month, day).atStartOfDay(ZoneOffset.UTC).toInstant().toEpochMilli();
    }

    private Long getOrCreateSeedUser() {
        List<Long> ids = jdbc.queryForList("SELECT id FROM users ORDER BY id LIMIT 1", Long.class);
        if (!ids.isEmpty()) {
            log.info("Using existing user id={} for seed orders.", ids.get(0));
            return ids.get(0);
        }
        long now = Instant.now().toEpochMilli();
        jdbc.update("""
                INSERT INTO users (email, password, first_name, last_name, created_date, modified_date)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                "seed@example.com",
                passwordEncoder.encode("Seed@12345"),
                "Seed", "User", now, now);
        Long uid = jdbc.queryForObject(
                "SELECT id FROM users WHERE email = 'seed@example.com'", Long.class);
        jdbc.update("INSERT INTO user_roles (user_id, role_value) VALUES (?, 1)", uid);
        log.info("Created seed user id={}.", uid);
        return uid;
    }

    private void logDistribution() {
        log.info("=== Order seed complete. Final distribution:");
        jdbc.queryForList("""
                SELECT status, COUNT(*) AS total,
                       SUM(CASE WHEN csv_imported THEN 1 ELSE 0 END) AS csv_count
                FROM orders
                GROUP BY status
                ORDER BY status
                """)
            .forEach(r -> log.info("  status={} | total={} | csv_imported={}",
                    r.get("status"), r.get("total"), r.get("csv_count")));
        Integer grand = jdbc.queryForObject("SELECT COUNT(*) FROM orders", Integer.class);
        log.info("  GRAND TOTAL: {}", grand);
    }
}
