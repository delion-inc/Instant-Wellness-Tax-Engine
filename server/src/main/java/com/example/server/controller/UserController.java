package com.example.server.controller;

import com.example.server.dto.user.UserDto;
import com.example.server.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Users management API")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Get current user", description = "Returns the currently authenticated user's details")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved current user",
                    content = @Content(schema = @Schema(implementation = UserDto.class))),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/current")
    public UserDto getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        return userService.getCurrentUserByEmail(email);
    }
} 