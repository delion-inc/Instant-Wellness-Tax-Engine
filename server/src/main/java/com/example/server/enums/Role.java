package com.example.server.enums;

import lombok.Getter;

@Getter
public enum Role {
    ROLE_USER(2001),
    ROLE_ADMIN(5320),
    ROLE_SPECIFIC(3450);

    private final int value;

    Role(int value) {
        this.value = value;
    }

    public static Role fromValue(int value) {
        for (Role role : Role.values()) {
            if (role.getValue() == value) {
                return role;
            }
        }
        throw new IllegalArgumentException("Invalid role value: " + value);
    }

    @Override
    public String toString() {
        return name();
    }
} 