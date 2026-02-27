package com.example.server.enums;

public enum DuplicateHandling {
    SKIP,
    OVERWRITE,
    FAIL;

    public static DuplicateHandling from(String value) {
        if (value == null) return SKIP;
        return switch (value.trim().toUpperCase()) {
            case "OVERWRITE" -> OVERWRITE;
            case "FAIL"      -> FAIL;
            default          -> SKIP;
        };
    }
}
