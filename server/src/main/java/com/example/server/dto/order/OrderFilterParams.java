package com.example.server.dto.order;

import com.example.server.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderFilterParams {

    private Long searchId;

    private Boolean csvImported;
    private OrderStatus status;

    private Long timestampFrom;
    private Long timestampTo;

    private BigDecimal taxAmountMin;
    private BigDecimal taxAmountMax;

    private BigDecimal compositeTaxRateMin;
    private BigDecimal compositeTaxRateMax;

    private String jurState;
    private String jurCounty;
    private String jurCity;
    private String jurSpecial;
    private Boolean hasSpecial;
}
