package com.example.server.service.impl;

import com.example.server.repository.TaxCalculationNativeRepository;
import com.example.server.service.TaxCalculationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TaxCalculationServiceImpl implements TaxCalculationService {

    private final TaxCalculationNativeRepository taxCalculationNativeRepository;

    @Override
    public int calculatePendingOrders() {
        return taxCalculationNativeRepository.calculatePendingOrders();
    }

    @Override
    public void calculateSingleOrder(Long orderId) {
        taxCalculationNativeRepository.calculateSingleOrder(orderId);
    }
}
