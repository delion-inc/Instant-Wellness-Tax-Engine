package com.example.server.service.impl;

import com.example.server.dto.order.CalculationBatchProgress;
import com.example.server.repository.TaxCalculationNativeRepository;
import com.example.server.service.TaxCalculationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.function.Consumer;

@Service
@RequiredArgsConstructor
public class TaxCalculationServiceImpl implements TaxCalculationService {

    private final TaxCalculationNativeRepository taxCalculationNativeRepository;

    @Override
    public int calculatePendingOrders() {
        return taxCalculationNativeRepository.calculatePendingOrders();
    }

    @Override
    public int calculatePendingOrders(Consumer<CalculationBatchProgress> onBatch) {
        return taxCalculationNativeRepository.calculatePendingOrders(onBatch);
    }

    @Override
    public void calculateSingleOrder(Long orderId) {
        taxCalculationNativeRepository.calculateSingleOrder(orderId);
    }
}
