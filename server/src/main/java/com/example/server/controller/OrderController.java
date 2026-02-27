package com.example.server.controller;

import com.example.server.dto.common.PageResponse;
import com.example.server.dto.order.CalculationProgressEvent;
import com.example.server.dto.order.ImportResultResponse;
import com.example.server.dto.order.ImportRowError;
import com.example.server.dto.order.OrderFilterRequest;
import com.example.server.dto.order.OrderRequest;
import com.example.server.dto.order.OrderResponse;
import com.example.server.entity.User;
import com.example.server.service.CalculationProgressStore;
import com.example.server.service.ImportBatchStore;
import com.example.server.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order management API")
public class OrderController {

    private final OrderService orderService;
    private final ImportBatchStore importBatchStore;
    private final CalculationProgressStore progressStore;

    @Operation(summary = "Create order manually")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrder(
            @RequestBody @Valid OrderRequest request,
            @AuthenticationPrincipal User currentUser) {
        return orderService.createOrder(request, currentUser.getId());
    }

    @Operation(summary = "List orders — page is 0-based. Params: page, pageSize, sort, + filter params.")
    @GetMapping
    public PageResponse<OrderResponse> getOrders(
            @PageableDefault(size = 25, sort = {"createdAt", "id"}, direction = Sort.Direction.DESC) Pageable pageable,
            @ModelAttribute OrderFilterRequest request) {
        return orderService.getOrders(request, pageable);
    }

    @Operation(summary = "Import orders from CSV",
               description = "duplicateHandling: skip | overwrite | fail (default: skip). " +
                             "outOfScopeHandling: mark | fail (default: mark).")
    @PostMapping("/import")
    public ImportResultResponse importCsv(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "skip") String duplicateHandling,
            @RequestParam(defaultValue = "mark") String outOfScopeHandling,
            @AuthenticationPrincipal User currentUser) {
        return orderService.importFromCsv(file, currentUser.getId(), duplicateHandling, outOfScopeHandling);
    }

    @Operation(summary = "Subscribe to real-time tax calculation progress via SSE",
               description = "Connect before or after import. Replays final event if calculation already completed.")
    @GetMapping(value = "/imports/{trackingId}/progress", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeToProgress(@PathVariable String trackingId) {
        return progressStore.subscribe(trackingId);
    }

    @Operation(summary = "Get final calculation result for a tracking ID")
    @GetMapping("/imports/{trackingId}/calculation")
    public ResponseEntity<CalculationProgressEvent> getCalculationResult(@PathVariable String trackingId) {
        return progressStore.getResult(trackingId)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Calculation result not found or still in progress: " + trackingId));
    }

    @Operation(summary = "Download CSV error report for an import batch")
    @GetMapping("/imports/{batchId}/errors")
    public ResponseEntity<byte[]> getImportErrors(@PathVariable String batchId) {
        if (!importBatchStore.exists(batchId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Batch not found: " + batchId);
        }

        List<ImportRowError> errors = importBatchStore.get(batchId);
        byte[] csv = buildErrorCsv(errors);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"import-" + batchId + "-errors.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csv);
    }

    private byte[] buildErrorCsv(List<ImportRowError> errors) {
        StringBuilder sb = new StringBuilder();
        sb.append("rowNumber,externalId,reason,field,message,rawRow\n");
        for (ImportRowError e : errors) {
            sb.append(csvCell(e.getRowNumber()))  .append(',')
              .append(csvCell(e.getExternalId()))  .append(',')
              .append(csvCell(e.getReason()))       .append(',')
              .append(csvCell(e.getField()))        .append(',')
              .append(csvCell(e.getMessage()))      .append(',')
              .append(csvCell(e.getRawRow()))       .append('\n');
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private static String csvCell(Object value) {
        if (value == null) return "";
        String s = value.toString().replace("\"", "\"\"");
        return s.contains(",") || s.contains("\"") || s.contains("\n") ? "\"" + s + "\"" : s;
    }
}
