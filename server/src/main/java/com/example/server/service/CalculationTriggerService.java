package com.example.server.service;

import com.example.server.dto.order.CalculationProgressEvent;
import com.example.server.dto.order.ImportRowError;
import com.example.server.dto.order.ImportableRow;
import com.example.server.enums.ImportErrorReason;
import com.example.server.enums.OutOfScopeHandling;
import com.example.server.repository.native_query.OrderNativeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CalculationTriggerService {

    private final TaxCalculationService taxCalculationService;
    private final OrderNativeRepository orderNativeRepository;
    private final ImportBatchStore importBatchStore;
    private final CalculationProgressStore progressStore;

    @Async("calculationExecutor")
    public void calculateAndTrack(String trackingId,
                                  int importedRows,
                                  List<Long> externalIds,
                                  Map<Long, ImportableRow> externalIdMap,
                                  OutOfScopeHandling oosPolicy) {
        try {
            Thread.sleep(3_000); //HERE

            int[] totalCalculated = {0};
            int[] totalOutOfScope = {0};

            int calculated = taxCalculationService.calculatePendingOrders(batch -> {
                totalCalculated[0] = batch.totalCalculated();
                totalOutOfScope[0] = batch.totalOutOfScope();

                progressStore.emit(trackingId, CalculationProgressEvent.builder()
                        .trackingId(trackingId)
                        .calculated(batch.totalCalculated())
                        .outOfScope(batch.totalOutOfScope())
                        .pending(Math.max(0, batch.totalPending() - batch.totalProcessed()))
                        .total(batch.totalPending())
                        .batchCalculated(batch.batchCalculated())
                        .batchOutOfScope(batch.batchOutOfScope())
                        .batchSize(batch.batchSize())
                        .status("PROCESSING")
                        .build());
            });

            if (oosPolicy == OutOfScopeHandling.FAIL && totalOutOfScope[0] > 0) {
                List<Long> oosIds = orderNativeRepository.findOutOfScopeExternalIds(externalIds);
                List<ImportRowError> oosErrors = new ArrayList<>();

                for (Long oosExtId : oosIds) {
                    ImportableRow row = externalIdMap.get(oosExtId);
                    oosErrors.add(ImportRowError.builder()
                            .rowNumber(row != null ? row.getRowNumber() : null)
                            .externalId(oosExtId)
                            .reason(ImportErrorReason.OUT_OF_SCOPE)
                            .field("latitude/longitude")
                            .message("Point is outside NY State polygon.")
                            .rawRow(row != null ? row.getRawLine() : null)
                            .build());
                }

                int unknownOos = totalOutOfScope[0] - oosIds.size();
                for (int i = 0; i < unknownOos; i++) {
                    oosErrors.add(ImportRowError.builder()
                            .reason(ImportErrorReason.OUT_OF_SCOPE)
                            .field("latitude/longitude")
                            .message("Point is outside NY State polygon.")
                            .build());
                }

                importBatchStore.appendErrors(trackingId, oosErrors);
            }

            int finalTotal = totalCalculated[0] + totalOutOfScope[0];

            progressStore.emit(trackingId, CalculationProgressEvent.builder()
                    .trackingId(trackingId)
                    .calculated(totalCalculated[0])
                    .outOfScope(totalOutOfScope[0])
                    .pending(0)
                    .total(finalTotal)
                    .batchCalculated(0)
                    .batchOutOfScope(0)
                    .batchSize(0)
                    .status("COMPLETED")
                    .build());

        } catch (Exception e) {
            log.error("Async calculation failed for tracking {}: {}", trackingId, e.getMessage(), e);

            progressStore.emit(trackingId, CalculationProgressEvent.builder()
                    .trackingId(trackingId)
                    .calculated(0)
                    .outOfScope(0)
                    .pending(0)
                    .total(0)
                    .batchCalculated(0)
                    .batchOutOfScope(0)
                    .batchSize(0)
                    .status("FAILED")
                    .build());
        }
    }
}
