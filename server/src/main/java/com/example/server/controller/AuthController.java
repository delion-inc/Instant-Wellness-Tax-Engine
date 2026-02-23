package com.example.server.controller;

import com.example.server.dto.user.AuthRequest;
import com.example.server.dto.user.AuthResponse;
import com.example.server.dto.user.UserRequest;
import com.example.server.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authorization", description = "Authorization management API")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Login user", description = "Authenticates a user and returns access token")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully authenticated",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "401", description = "Invalid credentials"),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody @Valid AuthRequest request,
            HttpServletResponse response) {
        return ResponseEntity.ok(authService.login(request, response));
    }

    @Operation(summary = "Register new user", description = "Creates a new user account and returns access token")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully registered",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "409", description = "Email already exists")
    })
    @PostMapping("/registration")
    public ResponseEntity<AuthResponse> register(
            @RequestBody @Valid UserRequest request,
            HttpServletResponse response) {
        return ResponseEntity.ok(authService.register(request, response));
    }

    @Operation(summary = "Refresh token", description = "Generates new access token using refresh token")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully refreshed token",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "400", description = "Refresh token is missing"),
            @ApiResponse(responseCode = "401", description = "Invalid or expired refresh token")
    })
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response) {
        return ResponseEntity.ok(authService.refreshToken(refreshToken, response));
    }

    @Operation(summary = "Logout user", description = "Invalidates refresh token and clears cookie")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully logged out"),
            @ApiResponse(responseCode = "400", description = "Refresh token is missing"),
            @ApiResponse(responseCode = "401", description = "Invalid refresh token")
    })
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response) {
        authService.logout(refreshToken, response);
        return ResponseEntity.ok().build();
    }
} 