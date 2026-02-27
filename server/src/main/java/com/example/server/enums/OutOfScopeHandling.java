package com.example.server.enums;

public enum OutOfScopeHandling {
    MARK,
    FAIL;

    public static OutOfScopeHandling from(String value) {
        if (value == null) return MARK;
        return "fail".equalsIgnoreCase(value.trim()) ? FAIL : MARK;
    }
}
