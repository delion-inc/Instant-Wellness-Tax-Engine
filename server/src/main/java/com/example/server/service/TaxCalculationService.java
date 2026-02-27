package com.example.server.service;

import com.example.server.dto.order.CalculationBatchProgress;

import java.util.function.Consumer;

public interface TaxCalculationService {
    int calculatePendingOrders();
    int calculatePendingOrders(Consumer<CalculationBatchProgress> onBatch);
    void calculateSingleOrder(Long orderId);
}
