package com.example.server.mapper;

import com.example.server.dto.order.OrderResponse;
import com.example.server.entity.Order;
import org.springframework.stereotype.Component;

@Component
public class OrderMapper {

    public OrderResponse toResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .latitude(order.getLatitude())
                .longitude(order.getLongitude())
                .timestamp(order.getTimestamp())
                .subtotal(order.getSubtotal())
                .status(order.getStatus())
                .csvImported(order.isCsvImported())
                .createdBy(order.getCreatedBy())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
