package com.example.server.dto.order;

public record CalculationBatchProgress(
        int batchCalculated,
        int batchOutOfScope,
        int batchSize,
        int totalCalculated,
        int totalOutOfScope,
        int totalProcessed,
        int totalPending
) {}
