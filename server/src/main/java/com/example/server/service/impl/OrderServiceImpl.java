package com.example.server.service.impl;

import com.example.server.dto.common.PageResponse;
import com.example.server.dto.order.ImportResultResponse;
import com.example.server.dto.order.ImportRowError;
import com.example.server.dto.order.ImportSummary;
import com.example.server.dto.order.ImportableRow;
import com.example.server.dto.order.OrderFilterParams;
import com.example.server.dto.order.OrderFilterRequest;
import com.example.server.dto.order.OrderRequest;
import com.example.server.dto.order.OrderResponse;
import com.example.server.entity.Order;
import com.example.server.enums.DuplicateHandling;
import com.example.server.enums.ImportErrorReason;
import com.example.server.enums.ImportStatus;
import com.example.server.enums.OrderStatus;
import com.example.server.enums.OutOfScopeHandling;
import com.example.server.mapper.OrderMapper;
import com.example.server.repository.OrderRepository;
import com.example.server.repository.OrderSpecification;
import com.example.server.repository.native_query.OrderNativeRepository;
import com.example.server.service.CalculationTriggerService;
import com.example.server.service.ImportBatchStore;
import com.example.server.service.OrderService;
import com.example.server.service.TaxCalculationService;
import com.example.server.util.OrderCsvParser;
import com.example.server.util.OrderCsvParser.ParsedImportResult;
import com.example.server.util.OrderParamUtils;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final OrderCsvParser csvParser;
    private final OrderNativeRepository orderNativeRepository;
    private final TaxCalculationService taxCalculationService;
    private final CalculationTriggerService calculationTriggerService;
    private final ImportBatchStore importBatchStore;
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
                .searchId(OrderParamUtils.parseSearchId(request.getId()))
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
    public ImportResultResponse importFromCsv(MultipartFile file, Long userId,
                                              String duplicateHandling, String outOfScopeHandling) {
        String batchId = UUID.randomUUID().toString();
        DuplicateHandling dupPolicy   = DuplicateHandling.from(duplicateHandling);
        OutOfScopeHandling oosPolicy  = OutOfScopeHandling.from(outOfScopeHandling);

        ParsedImportResult parsed;
        try {
            parsed = csvParser.parseForImport(file);
        } catch (ResponseStatusException e) {
            return failedImport(batchId, e.getReason() != null ? e.getReason() : e.getMessage());
        }

        if (parsed.totalRows() == 0) {
            return failedImport(batchId, "CSV contained no data rows");
        }

        List<ImportRowError> allErrors = new ArrayList<>(parsed.errors());

        Map<Long, ImportableRow> externalIdMap = parsed.validRows().stream()
                .filter(r -> r.getExternalId() != null)
                .collect(Collectors.toMap(ImportableRow::getExternalId, r -> r, (a, b) -> a));

        List<Long> externalIds = externalIdMap.keySet().stream().toList();
        Set<Long> existingIds  = orderNativeRepository.getExistingExternalIds(externalIds);

        List<ImportableRow> toInsert    = new ArrayList<>();
        List<ImportableRow> toOverwrite = new ArrayList<>();
        int skippedDuplicates = 0;

        for (ImportableRow row : parsed.validRows()) {
            Long extId = row.getExternalId();
            boolean isDuplicate = extId != null && existingIds.contains(extId);

            if (!isDuplicate) {
                toInsert.add(row);
                continue;
            }

            switch (dupPolicy) {
                case SKIP -> skippedDuplicates++;
                case OVERWRITE -> toOverwrite.add(row);
                case FAIL -> allErrors.add(ImportRowError.builder()
                        .rowNumber(row.getRowNumber())
                        .externalId(extId)
                        .reason(ImportErrorReason.DUPLICATE_EXTERNAL_ID)
                        .field("id")
                        .message("External id " + extId + " already exists")
                        .rawRow(row.getRawLine())
                        .build());
            }
        }

        int insertedCount    = toInsert.isEmpty()    ? 0 : orderNativeRepository.batchInsertRows(toInsert, userId);
        int overwrittenCount = toOverwrite.isEmpty() ? 0 : orderNativeRepository.batchOverwriteRows(toOverwrite);
        int importedRows     = insertedCount + overwrittenCount;

        importBatchStore.save(batchId, allErrors);

        if (importedRows > 0) {
            calculationTriggerService.calculateAndTrack(batchId, importedRows, externalIds, externalIdMap, oosPolicy);
        }

        return buildResponse(batchId, parsed.totalRows(), importedRows, allErrors, skippedDuplicates);
    }

    private ImportResultResponse buildResponse(String batchId, int totalRows, int importedRows,
                                               List<ImportRowError> errors, int skipped) {
        int failedRows = errors.size();
        ImportStatus status = failedRows == 0 ? ImportStatus.COMPLETED : ImportStatus.COMPLETED_WITH_ERRORS;

        String message = String.format("Imported %d orders. %d rows failed validation. Tax calculation is running in background.",
                importedRows, failedRows);

        ImportSummary summary = ImportSummary.builder()
                .totalRows(totalRows)
                .parsedRows(totalRows - (int) errors.stream()
                        .filter(e -> e.getReason() == ImportErrorReason.MISSING_COLUMN
                                  || e.getReason() == ImportErrorReason.BAD_FORMAT
                                  || e.getReason() == ImportErrorReason.INVALID_TIMESTAMP)
                        .count())
                .importedRows(importedRows)
                .failedRows(failedRows)
                .skippedDuplicateRows(skipped)
                .build();

        return ImportResultResponse.builder()
                .trackingId(batchId)
                .status(status)
                .message(message)
                .summary(summary)
                .errorsPreview(errors)
                .build();
    }

    private ImportResultResponse failedImport(String batchId, String reason) {
        importBatchStore.save(batchId, List.of());
        return ImportResultResponse.builder()
                .trackingId(batchId)
                .status(ImportStatus.FAILED)
                .message(reason)
                .summary(ImportSummary.builder().build())
                .errorsPreview(List.of())
                .build();
    }
}
