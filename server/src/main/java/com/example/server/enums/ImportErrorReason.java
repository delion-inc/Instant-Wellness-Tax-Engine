package com.example.server.enums;

public enum ImportErrorReason {
    MISSING_COLUMN,
    BAD_FORMAT,
    INVALID_TIMESTAMP,
    INVALID_COORDINATES,
    OUT_OF_SCOPE,
    NEGATIVE_SUBTOTAL,
    DUPLICATE_EXTERNAL_ID,
    CALCULATION_FAILED,
    UNKNOWN
}
