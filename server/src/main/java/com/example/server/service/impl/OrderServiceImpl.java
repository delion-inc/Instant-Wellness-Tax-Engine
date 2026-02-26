package com.example.server.service.impl;

import com.example.server.dto.common.PageResponse;
import com.example.server.dto.order.ImportResultResponse;
import com.example.server.dto.order.OrderCsvRow;
import com.example.server.dto.order.OrderFilterParams;
import com.example.server.dto.order.OrderFilterRequest;
import com.example.server.dto.order.OrderRequest;
import com.example.server.dto.order.OrderResponse;
import com.example.server.entity.Order;
import com.example.server.enums.OrderStatus;
import com.example.server.mapper.OrderMapper;
import com.example.server.repository.OrderRepository;
import com.example.server.repository.OrderSpecification;
import com.example.server.repository.native_query.OrderNativeRepository;
import com.example.server.service.OrderService;
import com.example.server.service.TaxCalculationService;
import com.example.server.util.OrderCsvParser;
import com.example.server.util.OrderParamUtils;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
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
    private final TaxCalculationService taxCalculationService;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest request, Long userId) {
        Order saved = orderRepository.saveAndFlush(Order.builder()
                .externalId(request.getExternalId())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .timestamp(csvParser.parseTimestamp(request.getTimestamp()))
                .subtotal(csvParser.parseBigDecimal(request.getSubtotal(), "subtotal"))
                .status(OrderStatus.ADDED)
                .csvImported(false)
                .createdBy(userId)
                .build());

        taxCalculationService.calculateSingleOrder(saved.getId());

        entityManager.refresh(saved);
        return orderMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getOrders(OrderFilterRequest request, Pageable pageable) {
        OrderParamUtils.validatePageable(pageable);

        Long tsFrom = OrderParamUtils.parseTimestamp(request.getTimestampFrom(), "timestampFrom");
        Long tsTo   = OrderParamUtils.parseTimestamp(request.getTimestampTo(),   "timestampTo");

        OrderParamUtils.validateTimestampRange(tsFrom, tsTo);
        OrderParamUtils.validateRange(request.getTaxAmountMin(),        request.getTaxAmountMax(),
                                     "taxAmountMin",        "taxAmountMax");
        OrderParamUtils.validateRange(request.getCompositeTaxRateMin(), request.getCompositeTaxRateMax(),
                                     "compositeTaxRateMin", "compositeTaxRateMax");

        OrderFilterParams filters = OrderFilterParams.builder()
                .searchId(OrderParamUtils.parseSearchId(request.getSearch()))
                .csvImported(request.getCsvImported())
                .status(OrderParamUtils.parseStatus(request.getStatus()))
                .timestampFrom(tsFrom)
                .timestampTo(tsTo)
                .taxAmountMin(request.getTaxAmountMin())
                .taxAmountMax(request.getTaxAmountMax())
                .compositeTaxRateMin(request.getCompositeTaxRateMin())
                .compositeTaxRateMax(request.getCompositeTaxRateMax())
                .jurState(request.getJurState())
                .jurCounty(request.getJurCounty())
                .jurCity(request.getJurCity())
                .jurSpecial(request.getJurSpecial())
                .hasSpecial(request.getHasSpecial())
                .build();

        Sort sort = pageable.getSort();
        if (sort.getOrderFor("id") == null) {
            sort = sort.and(Sort.by(Sort.Direction.DESC, "id"));
        }
        Pageable stablePageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        Specification<Order> spec = OrderSpecification.from(filters);
        Page<Order> page = orderRepository.findAll(spec, stablePageable);

        List<String> sortStrings = pageable.getSort().stream()
                .map(o -> o.getProperty() + "," + o.getDirection().name().toLowerCase())
                .toList();

        return new PageResponse<>(
                page.getContent().stream().map(orderMapper::toResponse).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.hasNext(),
                page.hasPrevious(),
                sortStrings
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
        int calculated = taxCalculationService.calculatePendingOrders();

        return ImportResultResponse.builder()
                .imported(imported)
                .calculated(calculated)
                .message("Imported " + imported + " orders, calculated taxes for " + calculated)
                .build();
    }
}
