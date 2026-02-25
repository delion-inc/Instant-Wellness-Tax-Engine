package com.example.server.controller;

import com.example.server.service.TaxCalculationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order management API")
public class TaxController {

    private final TaxCalculationService taxCalculationService;

    @Operation(
        summary = "Calculate taxes for all pending orders",
        description = "Runs bulk PostGIS point-in-polygon lookup and updates tax fields " +
                      "for all orders with status=ADDED. Sets status to CALCULATED or OUT_OF_SCOPE."
    )
    @PostMapping("/calculate")
    public Map<String, Object> calculateTaxes() {
        int calculated = taxCalculationService.calculatePendingOrders();
        return Map.of(
                "calculated", calculated,
                "message", "Tax calculation complete"
        );
    }
}
