package com.example.server.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ReviewNotFound extends RuntimeException {
    private final HttpStatus status;

    public ReviewNotFound(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
} 