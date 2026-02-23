package com.example.server.service.impl;

import com.example.server.dto.user.UserDto;
import com.example.server.entity.User;
import com.example.server.exception.UserNotFound;
import com.example.server.mapper.UserMapper;
import com.example.server.repository.UserRepository;
import com.example.server.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public UserDto getCurrentUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(userMapper::toUserResponse)
                .orElseThrow(() -> new UserNotFound("User not found with email: " + email, HttpStatus.NOT_FOUND));
    }
}
