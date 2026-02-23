package com.example.server.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class UserNotFound extends RuntimeException {
    private final HttpStatus status;

    public UserNotFound(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
}
