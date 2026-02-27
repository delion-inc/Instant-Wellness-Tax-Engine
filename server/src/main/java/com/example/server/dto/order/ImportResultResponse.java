package com.example.server.dto.order;

import com.example.server.enums.ImportStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportResultResponse {
    private String trackingId;
    private ImportStatus status;
    private String message;
    private ImportSummary summary;
    private List<ImportRowError> errorsPreview;
}
