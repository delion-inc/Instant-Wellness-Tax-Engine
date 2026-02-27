package com.example.server.dto.order;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class CalculationProgressEvent {
    String trackingId;
    int calculated;
    int outOfScope;
    int pending;
    int total;
    int batchCalculated;
    int batchOutOfScope;
    int batchSize;
    String status;

    public boolean isTerminal() {
        return "COMPLETED".equals(status) || "FAILED".equals(status);
    }
}
