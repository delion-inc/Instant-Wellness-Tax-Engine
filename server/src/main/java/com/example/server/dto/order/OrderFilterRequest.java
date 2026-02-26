package com.example.server.dto.order;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
public class OrderFilterRequest {

    private String search;

    private Boolean csvImported;
    private String status;

    private String timestampFrom;
    private String timestampTo;

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
