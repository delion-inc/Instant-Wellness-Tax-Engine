package com.example.server.dto.order;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class ImportableRow {
    private int rowNumber;
    private String rawLine;
    private Long externalId;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Long timestamp;
    private BigDecimal subtotal;
}
