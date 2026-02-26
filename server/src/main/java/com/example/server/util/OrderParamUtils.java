package com.example.server.util;

import com.example.server.enums.OrderStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;

public final class OrderParamUtils {

    public static final int MAX_PAGE_SIZE = 200;

    private OrderParamUtils() {}

    public static void validatePageable(Pageable pageable) {
        if (pageable.getPageNumber() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "page must be >= 0");
        }
        if (pageable.getPageSize() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "pageSize must be > 0");
        }
        if (pageable.getPageSize() > MAX_PAGE_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "pageSize must be <= " + MAX_PAGE_SIZE);
        }
    }

    public static Long parseSearchId(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Long.parseLong(value.strip());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public static OrderStatus parseStatus(String value) {
        if (value == null) return null;
        try {
            return OrderStatus.valueOf(value.strip().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status: " + value);
        }
    }

    public static Long parseTimestamp(String value, String paramName) {
        if (value == null || value.isBlank()) return null;
        String s = value.strip();
        try { return OffsetDateTime.parse(s).toInstant().toEpochMilli(); } catch (DateTimeParseException ignored) {}
        try { return Instant.parse(s).toEpochMilli(); } catch (DateTimeParseException ignored) {}
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Invalid datetime format for '" + paramName + "': " + value
                + ". Use ISO-8601, e.g. 2026-02-01T00:00:00Z");
    }

    public static void validateTimestampRange(Long from, Long to) {
        if (from != null && to != null && from > to) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "timestampFrom must not be after timestampTo");
        }
    }

    public static void validateRange(BigDecimal min, BigDecimal max, String minName, String maxName) {
        if (min != null && max != null && min.compareTo(max) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    minName + " must not be greater than " + maxName);
        }
    }
}
