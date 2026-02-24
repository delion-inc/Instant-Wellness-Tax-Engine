package com.example.server.mapper;

import com.example.server.dto.user.UserDto;
import com.example.server.dto.user.UserPlaceDto;
import com.example.server.entity.User;
import com.example.server.enums.Role;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class UserMapper {

    public UserDto toUserResponse(User user) {
        if (user == null) {
            return null;
        }

        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(user.getRoles().stream()
                        .map(Role::getValue)
                        .collect(Collectors.toSet()))
                .build();
    }
}
