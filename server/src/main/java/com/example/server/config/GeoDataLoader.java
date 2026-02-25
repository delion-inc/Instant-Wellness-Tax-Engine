package com.example.server.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class GeoDataLoader implements ApplicationRunner {

    private static final List<String> NYC_COUNTY_FIPS = List.of(
            "36061", // New York County (Manhattan)
            "36047", // Kings County    (Brooklyn)
            "36081", // Queens County
            "36005", // Bronx County
            "36085"  // Richmond County (Staten Island)
    );

    private static final List<String> MCTD_COUNTY_FIPS = List.of(
            "36061", "36047", "36081", "36005", "36085", // NYC boroughs
            "36119", // Westchester
            "36087", // Rockland
            "36079", // Putnam
            "36071", // Orange
            "36027", // Dutchess
            "36105"  // Sullivan
    );

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM geo_jurisdictions", Integer.class);
        if (count != null && count > 0) {
            log.info("Geo boundaries already loaded ({} records), skipping.", count);
            return;
        }

        log.info("Loading NY county boundaries from ny_counties.geojson...");
        loadCounties();

        log.info("Building NYC derived polygon...");
        buildDerivedPolygon("CITY", "New York City", NYC_COUNTY_FIPS);

        log.info("Building MCTD derived polygon...");
        buildDerivedPolygon("SPECIAL", "MCTD", MCTD_COUNTY_FIPS);

        int total = jdbc.queryForObject("SELECT COUNT(*) FROM geo_jurisdictions", Integer.class);
        log.info("Geo boundaries loaded: {} records (62 counties + NYC + MCTD).", total);
    }

    private void loadCounties() throws Exception {
        var resource = new ClassPathResource("geodata/ny_counties.geojson");
        JsonNode root = objectMapper.readTree(resource.getInputStream());

        int inserted = 0;
        for (JsonNode feature : root.get("features")) {
            JsonNode props    = feature.get("properties");
            String name       = props.get("NAMELSAD").asText();  // e.g. "Albany County"
            String fips       = props.get("GEOID").asText();     // e.g. "36001"
            String geomJson   = feature.get("geometry").toString();

            // Ensure MultiPolygon (Census uses both Polygon and MultiPolygon)
            String geomType = feature.get("geometry").get("type").asText();
            String wrappedGeom = geomType.equals("Polygon")
                    ? wrapAsMultiPolygon(feature.get("geometry"))
                    : geomJson;

            jdbc.update("""
                    INSERT INTO geo_jurisdictions (type, name, fips_code, state_code, geom)
                    VALUES ('COUNTY', ?, ?, 'NY',
                            ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON(?), 4326)))
                    """, name, fips, wrappedGeom);
            inserted++;
        }
        log.info("Inserted {} county polygons.", inserted);
    }

    private void buildDerivedPolygon(String type, String name, List<String> fipsCodes) {
        String placeholders = String.join(",", fipsCodes.stream()
                .map(f -> "?").toList());

        jdbc.update("""
                INSERT INTO geo_jurisdictions (type, name, state_code, geom)
                SELECT ?, ?, 'NY', ST_Multi(ST_Union(geom))
                FROM geo_jurisdictions
                WHERE type = 'COUNTY' AND fips_code IN (%s)
                """.formatted(placeholders),
                prepend(type, name, fipsCodes.toArray()));
    }

    private Object[] prepend(Object first, Object second, Object[] rest) {
        Object[] result = new Object[rest.length + 2];
        result[0] = first;
        result[1] = second;
        System.arraycopy(rest, 0, result, 2, rest.length);
        return result;
    }

    private String wrapAsMultiPolygon(JsonNode polygonGeom) throws Exception {
        return objectMapper.writeValueAsString(
                objectMapper.createObjectNode()
                        .put("type", "MultiPolygon")
                        .set("coordinates", objectMapper.createArrayNode()
                                .add(polygonGeom.get("coordinates"))));
    }
}
