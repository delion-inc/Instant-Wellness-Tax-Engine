package com.example.server.util;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

@Component
public class CookieUtil {
    
    private static final String COOKIE_PATH = "/";
    private static final String SAME_SITE = "None";
    private static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
    private static final long REFRESH_TOKEN_MAX_AGE = 604800;

    public void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        setCookie(response, REFRESH_TOKEN_COOKIE_NAME, refreshToken, REFRESH_TOKEN_MAX_AGE);
    }

    public void clearRefreshTokenCookie(HttpServletResponse response) {
        setCookie(response, REFRESH_TOKEN_COOKIE_NAME, "", 0);
    }

    private void setCookie(HttpServletResponse response, String name, String value, long maxAge) {
        response.setHeader("Set-Cookie",
                String.format("%s=%s; Path=%s; HttpOnly; Secure; SameSite=%s; Max-age=%d",
                        name, value, COOKIE_PATH, SAME_SITE, maxAge));
    }
} 