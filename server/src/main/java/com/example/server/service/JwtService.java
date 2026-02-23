package com.example.server.service;

import com.example.server.entity.User;
import org.springframework.security.core.userdetails.UserDetails;

public interface JwtService {
    String generateAccessToken(UserDetails userDetails);
    String generateRefreshToken(User user);
    boolean isAccessTokenValid(String token, UserDetails userDetails);
    boolean isRefreshTokenValid(String token, User user);
    String extractUsername(String token);
} 