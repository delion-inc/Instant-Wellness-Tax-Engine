package com.example.server.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Seeds tax_rates from NY Publication 718-CS (effective 2024).
 * Runs after GeoDataLoader (Order(2) vs Order(1)).
 *
 * Rate structure:
 *   - STATE   4.000% — all of NY State (no polygon needed, virtual entry)
 *   - COUNTY  varies by county (from Publication 718)
 *   - CITY    4.500% — New York City (5 boroughs)
 *   - SPECIAL 0.375% — MCTD (Metropolitan Commuter Transportation District)
 */
@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class TaxRateSeeder implements ApplicationRunner {

    private final JdbcTemplate jdbc;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM tax_rates", Integer.class);
        if (count != null && count > 0) {
            log.info("Tax rates already seeded ({} records), skipping.", count);
            return;
        }

        log.info("Seeding NY tax rates (Publication 718)...");

        seedStateRate();
        seedCityRate();
        seedMctdRate();
        seedCountyRates();

        int total = jdbc.queryForObject("SELECT COUNT(*) FROM tax_rates", Integer.class);
        log.info("Tax rates seeded: {} records.", total);
    }

    private void seedStateRate() {
        // NY State applies to every point in NY — we insert it once linked to
        // a special "New York State" jurisdiction that covers the whole state boundary.
        // For simplicity we re-use the union of all counties as the state polygon.
        jdbc.update("""
                INSERT INTO geo_jurisdictions (type, name, fips_code, state_code, geom)
                SELECT 'STATE', 'New York State', '36', 'NY', ST_Multi(ST_Union(geom))
                FROM geo_jurisdictions WHERE type = 'COUNTY'
                """);

        insertRate("STATE", "New York State", "STATE", 0.040000);
    }

    private void seedCityRate() {
        insertRate("CITY", "New York City", "CITY", 0.045000);
    }

    private void seedMctdRate() {
        insertRate("SPECIAL", "MCTD", "SPECIAL", 0.003750);
    }

    private void seedCountyRates() {
        // Source: NY Publication 718-CS (2024)
        // Format: (FIPS, county name, combined local rate)
        // Note: for NYC counties the city rate supersedes, county rate = 0
        List<Object[]> rates = List.of(
            // NYC boroughs — county rate is 0 (superseded by NYC city rate)
            new Object[]{"36061", "New York County",    0.000000},
            new Object[]{"36047", "Kings County",       0.000000},
            new Object[]{"36081", "Queens County",      0.000000},
            new Object[]{"36005", "Bronx County",       0.000000},
            new Object[]{"36085", "Richmond County",    0.000000},
            // MCTD counties (have MCTD on top, county rate varies)
            new Object[]{"36119", "Westchester County", 0.015000},
            new Object[]{"36087", "Rockland County",    0.040000},
            new Object[]{"36079", "Putnam County",      0.020000},
            new Object[]{"36071", "Orange County",      0.037500},
            new Object[]{"36027", "Dutchess County",    0.037500},
            new Object[]{"36105", "Sullivan County",    0.040000},
            // Rest of NY counties
            new Object[]{"36001", "Albany County",      0.040000},
            new Object[]{"36003", "Allegany County",    0.048000},
            new Object[]{"36007", "Broome County",      0.040000},
            new Object[]{"36009", "Cattaraugus County", 0.045000},
            new Object[]{"36011", "Cayuga County",      0.040000},
            new Object[]{"36013", "Chautauqua County",  0.045000},
            new Object[]{"36015", "Chemung County",     0.040000},
            new Object[]{"36017", "Chenango County",    0.040000},
            new Object[]{"36019", "Clinton County",     0.040000},
            new Object[]{"36021", "Columbia County",    0.040000},
            new Object[]{"36023", "Cortland County",    0.040000},
            new Object[]{"36025", "Delaware County",    0.040000},
            new Object[]{"36029", "Erie County",        0.047500},
            new Object[]{"36031", "Essex County",       0.040000},
            new Object[]{"36033", "Franklin County",    0.040000},
            new Object[]{"36035", "Fulton County",      0.040000},
            new Object[]{"36037", "Genesee County",     0.040000},
            new Object[]{"36039", "Greene County",      0.040000},
            new Object[]{"36041", "Hamilton County",    0.040000},
            new Object[]{"36043", "Herkimer County",    0.045000},
            new Object[]{"36045", "Jefferson County",   0.040000},
            new Object[]{"36049", "Lewis County",       0.040000},
            new Object[]{"36051", "Livingston County",  0.040000},
            new Object[]{"36053", "Madison County",     0.040000},
            new Object[]{"36055", "Monroe County",      0.040000},
            new Object[]{"36057", "Montgomery County",  0.045000},
            new Object[]{"36059", "Nassau County",      0.042500},
            new Object[]{"36063", "Niagara County",     0.047500},
            new Object[]{"36065", "Oneida County",      0.047500},
            new Object[]{"36067", "Onondaga County",    0.040000},
            new Object[]{"36069", "Ontario County",     0.040000},
            new Object[]{"36073", "Orleans County",     0.040000},
            new Object[]{"36075", "Oswego County",      0.040000},
            new Object[]{"36077", "Otsego County",      0.040000},
            new Object[]{"36083", "Rensselaer County",  0.040000},
            new Object[]{"36089", "St. Lawrence County",0.040000},
            new Object[]{"36091", "Saratoga County",    0.030000},
            new Object[]{"36093", "Schenectady County", 0.040000},
            new Object[]{"36095", "Schoharie County",   0.040000},
            new Object[]{"36097", "Schuyler County",    0.040000},
            new Object[]{"36099", "Seneca County",      0.040000},
            new Object[]{"36101", "Steuben County",     0.040000},
            new Object[]{"36103", "Suffolk County",     0.045000},
            new Object[]{"36107", "Tioga County",       0.040000},
            new Object[]{"36109", "Tompkins County",    0.040000},
            new Object[]{"36111", "Ulster County",      0.040000},
            new Object[]{"36113", "Warren County",      0.040000},
            new Object[]{"36115", "Washington County",  0.040000},
            new Object[]{"36117", "Wayne County",       0.040000},
            new Object[]{"36121", "Wyoming County",     0.040000},
            new Object[]{"36123", "Yates County",       0.040000}
        );

        for (Object[] r : rates) {
            String fips  = (String) r[0];
            double rate  = (double) r[2];
            jdbc.update("""
                    INSERT INTO tax_rates (jurisdiction_id, rate_type, rate, valid_from)
                    SELECT id, 'COUNTY', ?, '2024-01-01'
                    FROM geo_jurisdictions
                    WHERE type = 'COUNTY' AND fips_code = ?
                    """, rate, fips);
        }
    }

    private void insertRate(String jurisdictionType, String jurisdictionName,
                            String rateType, double rate) {
        jdbc.update("""
                INSERT INTO tax_rates (jurisdiction_id, rate_type, rate, valid_from)
                SELECT id, ?, ?, '2024-01-01'
                FROM geo_jurisdictions
                WHERE type = ? AND name = ?
                """, rateType, rate, jurisdictionType, jurisdictionName);
    }
}
