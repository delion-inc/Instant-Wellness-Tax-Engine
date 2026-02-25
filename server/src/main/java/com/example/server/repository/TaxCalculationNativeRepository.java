package com.example.server.repository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Repository
@RequiredArgsConstructor
public class TaxCalculationNativeRepository {

    private static final String CALCULATE_SQL = """
            WITH jurisdiction_rates AS (
                SELECT
                    o.id                                                                AS order_id,
                    COALESCE(MAX(CASE WHEN tr.rate_type = 'STATE'   THEN tr.rate END), 0) AS state_rate,
                    COALESCE(MAX(CASE WHEN tr.rate_type = 'COUNTY'  THEN tr.rate END), 0) AS county_rate,
                    COALESCE(MAX(CASE WHEN tr.rate_type = 'CITY'    THEN tr.rate END), 0) AS city_rate,
                    COALESCE(SUM(CASE WHEN tr.rate_type = 'SPECIAL' THEN tr.rate END), 0) AS special_sum,
                    jsonb_agg(
                        jsonb_build_object('name', j.name, 'rate', tr.rate)
                    ) FILTER (WHERE tr.rate_type = 'SPECIAL')                          AS special_rates_json,
                    jsonb_build_object(
                        'state',   MAX(CASE WHEN j.type = 'STATE'   THEN j.name END),
                        'county',  MAX(CASE WHEN j.type = 'COUNTY'  THEN j.name END),
                        'city',    MAX(CASE WHEN j.type = 'CITY'    THEN j.name END),
                        'special', jsonb_agg(j.name) FILTER (WHERE j.type = 'SPECIAL')
                    )                                                                   AS jurisdictions_json
                FROM orders o
                JOIN geo_jurisdictions j
                    ON ST_Contains(j.geom,
                       ST_SetSRID(ST_MakePoint(CAST(o.longitude AS float8),
                                               CAST(o.latitude  AS float8)), 4326))
                JOIN tax_rates tr
                    ON tr.jurisdiction_id = j.id
                   AND (tr.valid_to IS NULL OR tr.valid_to >= CURRENT_DATE)
                WHERE %s
                GROUP BY o.id
            )
            UPDATE orders o
            SET
                state_rate         = jr.state_rate,
                county_rate        = jr.county_rate,
                city_rate          = jr.city_rate,
                special_rates      = jr.special_rates_json,
                composite_tax_rate = jr.state_rate + jr.county_rate + jr.city_rate + jr.special_sum,
                tax_amount         = o.subtotal * (jr.state_rate + jr.county_rate + jr.city_rate + jr.special_sum),
                total_amount       = o.subtotal * (1 + jr.state_rate + jr.county_rate + jr.city_rate + jr.special_sum),
                jurisdictions      = jr.jurisdictions_json,
                status             = 'CALCULATED',
                updated_at         = now()
            FROM jurisdiction_rates jr
            WHERE o.id = jr.order_id
            """;

    private final JdbcTemplate jdbc;

    @Transactional
    public int calculatePendingOrders() {
        int calculated = jdbc.update(CALCULATE_SQL.formatted("o.status = 'ADDED'"));

        int outOfScope = jdbc.update("""
                UPDATE orders SET status = 'OUT_OF_SCOPE', updated_at = now()
                WHERE status = 'ADDED'
                """);

        log.info("Bulk tax calculation: {} calculated, {} out of scope.", calculated, outOfScope);
        return calculated;
    }

    @Transactional
    public void calculateSingleOrder(Long orderId) {
        int calculated = jdbc.update(
                CALCULATE_SQL.formatted("o.id = ? AND o.status = 'ADDED'"),
                orderId);

        if (calculated == 0) {
            jdbc.update("""
                    UPDATE orders SET status = 'OUT_OF_SCOPE', updated_at = now()
                    WHERE id = ? AND status = 'ADDED'
                    """, orderId);
            log.debug("Order {} is out of scope.", orderId);
        }
    }
}
