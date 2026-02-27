package com.example.server.service;

import com.example.server.dto.common.PageResponse;
import com.example.server.dto.order.ImportResultResponse;
import com.example.server.dto.order.OrderFilterRequest;
import com.example.server.dto.order.OrderRequest;
import com.example.server.dto.order.OrderResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface OrderService {

    OrderResponse createOrder(OrderRequest request, Long userId);

    PageResponse<OrderResponse> getOrders(OrderFilterRequest request, Pageable pageable);

    ImportResultResponse importFromCsv(MultipartFile file, Long userId,
                                       String duplicateHandling, String outOfScopeHandling);

    ImportResultResponse getCalculationResult(String trackingId);
}
