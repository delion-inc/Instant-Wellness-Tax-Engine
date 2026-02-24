package com.example.server.service;

import com.example.server.dto.user.UserDto;

import java.util.List;

public interface UserService {
    UserDto getCurrentUserByEmail(String email);
}
