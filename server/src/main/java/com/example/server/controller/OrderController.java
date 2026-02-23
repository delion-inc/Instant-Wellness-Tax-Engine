package com.example.server.controller;

import com.example.server.dto.common.PageResponse;
import com.example.server.dto.order.ImportResultResponse;
import com.example.server.dto.order.OrderRequest;
import com.example.server.dto.order.OrderResponse;
import com.example.server.entity.User;
import com.example.server.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order management API")
public class OrderController {

    private final OrderService orderService;

    @Operation(summary = "Create order manually")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrder(
            @RequestBody @Valid OrderRequest request,
            @AuthenticationPrincipal User currentUser) {
        return orderService.createOrder(request, currentUser.getId());
    }

    @Operation(summary = "List orders — page is 1-based, e.g. ?page=1&pageSize=10")
    @GetMapping
    public PageResponse<OrderResponse> getOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        PageRequest pageable = PageRequest.of(Math.max(page - 1, 0), pageSize, Sort.by("id").descending());
        return orderService.getOrders(pageable);
    }

    @Operation(summary = "Import orders from CSV",
               description = "Multipart field: 'file'. Columns: id (optional), latitude, longitude, timestamp, subtotal.")
    @PostMapping("/import")
    @ResponseStatus(HttpStatus.CREATED)
    public ImportResultResponse importCsv(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User currentUser) {
        return orderService.importFromCsv(file, currentUser.getId());
    }
}
