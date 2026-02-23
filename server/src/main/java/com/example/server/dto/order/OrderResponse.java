package com.example.server.dto.order;

import com.example.server.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private Long id;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Long timestamp;
    private BigDecimal subtotal;
    private OrderStatus status;
    private boolean csvImported;
    private Long createdBy;
    private Instant createdAt;
    private Instant updatedAt;
}
