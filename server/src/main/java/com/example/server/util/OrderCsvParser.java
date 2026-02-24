package com.example.server.util;

import com.example.server.dto.order.OrderCsvRow;
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
import java.util.List;

@Component
public class OrderCsvParser {

    private static final java.time.format.DateTimeFormatter PG_TIMESTAMP_FMT =
            new DateTimeFormatterBuilder()
                    .appendPattern("yyyy-MM-dd HH:mm:ss")
                    .optionalStart()
                    .appendFraction(ChronoField.NANO_OF_SECOND, 0, 9, true)
                    .optionalEnd()
                    .toFormatter();

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
