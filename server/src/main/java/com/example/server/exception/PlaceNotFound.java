package com.example.server.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class PlaceNotFound extends RuntimeException {
    private final HttpStatus status;

    public PlaceNotFound(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
}
