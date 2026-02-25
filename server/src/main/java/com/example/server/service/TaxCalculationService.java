package com.example.server.service;

public interface TaxCalculationService {
    int calculatePendingOrders();
    void calculateSingleOrder(Long orderId);
}
