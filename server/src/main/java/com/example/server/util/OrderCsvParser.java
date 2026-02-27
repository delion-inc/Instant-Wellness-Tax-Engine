package com.example.server.util;

import com.example.server.dto.order.ImportRowError;
import com.example.server.dto.order.ImportableRow;
import com.example.server.dto.order.OrderCsvRow;
import com.example.server.enums.ImportErrorReason;
import com.opencsv.CSVReader;
import com.opencsv.bean.CsvToBeanBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoField;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class OrderCsvParser {

    private static final java.time.format.DateTimeFormatter PG_TIMESTAMP_FMT =
            new DateTimeFormatterBuilder()
                    .appendPattern("yyyy-MM-dd HH:mm:ss")
                    .optionalStart()
                    .appendFraction(ChronoField.NANO_OF_SECOND, 0, 9, true)
                    .optionalEnd()
                    .toFormatter();

    private static final BigDecimal LAT_MIN = BigDecimal.valueOf(-90);
    private static final BigDecimal LAT_MAX = BigDecimal.valueOf(90);
    private static final BigDecimal LON_MIN = BigDecimal.valueOf(-180);
    private static final BigDecimal LON_MAX = BigDecimal.valueOf(180);

    public List<OrderCsvRow> parse(MultipartFile file) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CSV file is empty");
        }
        try {
            return new CsvToBeanBuilder<OrderCsvRow>(
                    new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))
                    .withType(OrderCsvRow.class)
                    .withIgnoreLeadingWhiteSpace(true)
                    .build()
                    .parse();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to parse CSV: " + e.getMessage());
        }
    }

    public record ParsedImportResult(List<ImportableRow> validRows, List<ImportRowError> errors, int totalRows) {}

    public ParsedImportResult parseForImport(MultipartFile file) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CSV file is empty");
        }

        List<ImportableRow> validRows = new ArrayList<>();
        List<ImportRowError> errors = new ArrayList<>();
        int totalRows = 0;

        try (CSVReader reader = new CSVReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String[] header = reader.readNext();
            if (header == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CSV file has no header row");
            }

            Map<String, Integer> idx = buildColumnIndex(header);
            String[] fields;
            int rowNum = 1;

            while ((fields = reader.readNext()) != null) {
                rowNum++;
                totalRows++;
                String rawLine = String.join(",", fields);

                ImportRowError err = validateRow(fields, idx, rowNum, rawLine);
                if (err != null) {
                    errors.add(err);
                    continue;
                }

                String latStr  = field(fields, idx, "latitude");
                String lonStr  = field(fields, idx, "longitude");
                String tsStr   = field(fields, idx, "timestamp");
                String subStr  = field(fields, idx, "subtotal");
                String idStr   = field(fields, idx, "id");

                validRows.add(new ImportableRow(
                        rowNum,
                        rawLine,
                        parseExternalId(idStr),
                        new BigDecimal(latStr),
                        new BigDecimal(lonStr),
                        parseTimestamp(tsStr),
                        new BigDecimal(subStr)
                ));
            }

        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to read CSV: " + e.getMessage());
        }

        return new ParsedImportResult(validRows, errors, totalRows);
    }

    private ImportRowError validateRow(String[] fields, Map<String, Integer> idx, int rowNum, String rawLine) {
        String latStr  = field(fields, idx, "latitude");
        String lonStr  = field(fields, idx, "longitude");
        String tsStr   = field(fields, idx, "timestamp");
        String subStr  = field(fields, idx, "subtotal");

        if (latStr == null) return rowError(rowNum, null, rawLine, ImportErrorReason.MISSING_COLUMN, "latitude", "latitude is required");
        if (lonStr == null) return rowError(rowNum, null, rawLine, ImportErrorReason.MISSING_COLUMN, "longitude", "longitude is required");
        if (tsStr  == null) return rowError(rowNum, null, rawLine, ImportErrorReason.MISSING_COLUMN, "timestamp", "timestamp is required");
        if (subStr == null) return rowError(rowNum, null, rawLine, ImportErrorReason.MISSING_COLUMN, "subtotal",  "subtotal is required");

        BigDecimal lat, lon, sub;
        try { lat = new BigDecimal(latStr); } catch (NumberFormatException e) {
            return rowError(rowNum, null, rawLine, ImportErrorReason.BAD_FORMAT, "latitude", "Cannot parse latitude: " + latStr);
        }
        try { lon = new BigDecimal(lonStr); } catch (NumberFormatException e) {
            return rowError(rowNum, null, rawLine, ImportErrorReason.BAD_FORMAT, "longitude", "Cannot parse longitude: " + lonStr);
        }
        try { sub = new BigDecimal(subStr); } catch (NumberFormatException e) {
            return rowError(rowNum, null, rawLine, ImportErrorReason.BAD_FORMAT, "subtotal", "Cannot parse subtotal: " + subStr);
        }

        try { parseTimestamp(tsStr); } catch (Exception e) {
            return rowError(rowNum, null, rawLine, ImportErrorReason.INVALID_TIMESTAMP, "timestamp", "Cannot parse timestamp: " + tsStr);
        }

        if (lat.compareTo(LAT_MIN) < 0 || lat.compareTo(LAT_MAX) > 0) {
            return rowError(rowNum, null, rawLine, ImportErrorReason.INVALID_COORDINATES, "latitude", "Latitude out of range [-90, 90]: " + lat);
        }
        if (lon.compareTo(LON_MIN) < 0 || lon.compareTo(LON_MAX) > 0) {
            return rowError(rowNum, null, rawLine, ImportErrorReason.INVALID_COORDINATES, "longitude", "Longitude out of range [-180, 180]: " + lon);
        }
        if (sub.compareTo(BigDecimal.ZERO) <= 0) {
            return rowError(rowNum, null, rawLine, ImportErrorReason.NEGATIVE_SUBTOTAL, "subtotal", "subtotal must be > 0, got: " + sub);
        }

        return null;
    }

    private static ImportRowError rowError(int rowNum, Long externalId, String rawLine,
                                           ImportErrorReason reason, String field, String message) {
        return ImportRowError.builder()
                .rowNumber(rowNum)
                .externalId(externalId)
                .reason(reason)
                .field(field)
                .message(message)
                .rawRow(rawLine)
                .build();
    }

    private static Map<String, Integer> buildColumnIndex(String[] header) {
        Map<String, Integer> map = new HashMap<>();
        for (int i = 0; i < header.length; i++) {
            map.put(header[i].trim().toLowerCase(), i);
        }
        return map;
    }

    private static String field(String[] row, Map<String, Integer> idx, String name) {
        Integer i = idx.get(name);
        if (i == null || i >= row.length) return null;
        String v = row[i];
        return (v == null || v.isBlank()) ? null : v.trim();
    }

    public BigDecimal parseBigDecimal(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing required field: " + fieldName);
        }
        try {
            return new BigDecimal(value.trim());
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid value for '" + fieldName + "': " + value);
        }
    }

    public Long parseExternalId(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Long.parseLong(value.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public long parseTimestamp(String value) {
        if (value == null || value.isBlank()) {
            return Instant.now().toEpochMilli();
        }
        String s = value.trim();
        try { return Long.parseLong(s); } catch (NumberFormatException ignored) {}
        try { return OffsetDateTime.parse(s).toInstant().toEpochMilli(); } catch (DateTimeParseException ignored) {}
        try { return Instant.parse(s).toEpochMilli(); } catch (DateTimeParseException ignored) {}
        try {
            return LocalDateTime.parse(s, PG_TIMESTAMP_FMT).toInstant(ZoneOffset.UTC).toEpochMilli();
        } catch (DateTimeParseException ignored) {}

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Cannot parse timestamp '" + value + "'. Use ISO-8601 or 'yyyy-MM-dd HH:mm:ss[.nnnnnnnnn]'.");
    }
}
