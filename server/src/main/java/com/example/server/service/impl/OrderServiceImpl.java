package com.example.server.service.impl;

import com.example.server.dto.common.PageResponse;
import com.example.server.dto.order.ImportResultResponse;
import com.example.server.dto.order.OrderCsvRow;
import com.example.server.dto.order.OrderRequest;
import com.example.server.dto.order.OrderResponse;
import com.example.server.entity.Order;
import com.example.server.enums.OrderStatus;
import com.example.server.mapper.OrderMapper;
import com.example.server.repository.OrderRepository;
import com.example.server.service.OrderService;
import com.example.server.util.OrderCsvParser;
import com.example.server.repository.native_query.OrderNativeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final OrderCsvParser csvParser;
    private final OrderNativeRepository orderNativeRepository;

    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest request, Long userId) {
        Order saved = orderRepository.save(Order.builder()
                .externalId(request.getExternalId())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .timestamp(csvParser.parseTimestamp(request.getTimestamp()))
                .subtotal(csvParser.parseBigDecimal(request.getSubtotal(), "subtotal"))
                .status(OrderStatus.ADDED)
                .csvImported(false)
                .createdBy(userId)
                .build());
        return orderMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getOrders(Pageable pageable) {
        Page<Order> page = orderRepository.findAll(pageable);
        return new PageResponse<>(
                page.getContent().stream().map(orderMapper::toResponse).toList(),
                (int) page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber() + 1
        );
    }

    @Override
    @Transactional
    public ImportResultResponse importFromCsv(MultipartFile file, Long userId) {
        List<OrderCsvRow> rows = csvParser.parse(file);

        if (rows.isEmpty()) {
            return ImportResultResponse.builder()
                    .imported(0)
                    .message("CSV contained no data rows")
                    .build();
        }

        int imported = orderNativeRepository.batchInsert(rows, userId);

        return ImportResultResponse.builder()
                .imported(imported)
                .message("Successfully imported " + imported + " orders")
                .build();
    }
}
