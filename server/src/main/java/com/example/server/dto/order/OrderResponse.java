package com.example.server.dto.order;

import com.example.server.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private Long id;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String timestamp;
    private BigDecimal subtotal;
    private OrderStatus status;
    private boolean csvImported;
    private Long createdBy;
    private Instant createdAt;
    private Instant updatedAt;
    private BigDecimal compositeTaxRate;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private BigDecimal stateRate;
    private BigDecimal countyRate;
    private BigDecimal cityRate;
    private List<SpecialRateEntry> specialRates;
    private Map<String, Object> jurisdictions;
}
