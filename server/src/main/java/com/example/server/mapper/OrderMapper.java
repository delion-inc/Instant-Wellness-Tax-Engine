package com.example.server.mapper;

import com.example.server.dto.order.OrderResponse;
import com.example.server.entity.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Component
public class OrderMapper {

    public OrderResponse toResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .latitude(order.getLatitude())
                .longitude(order.getLongitude())
                .timestamp(toIso(order.getTimestamp()))
                .subtotal(round2(order.getSubtotal()))
                .status(order.getStatus())
                .csvImported(order.isCsvImported())
                .createdBy(order.getCreatedBy())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .compositeTaxRate(order.getCompositeTaxRate())
                .taxAmount(round2(order.getTaxAmount()))
                .totalAmount(round2(order.getTotalAmount()))
                .stateRate(order.getStateRate())
                .countyRate(order.getCountyRate())
                .cityRate(order.getCityRate())
                .specialRates(order.getSpecialRates())
                .jurisdictions(order.getJurisdictions())
                .build();
    }

    private String toIso(Long epochMillis) {
        if (epochMillis == null) return null;
        return Instant.ofEpochMilli(epochMillis).toString();
    }

    private BigDecimal round2(BigDecimal value) {
        if (value == null) return null;
        return value.setScale(2, RoundingMode.HALF_UP);
    }
}
