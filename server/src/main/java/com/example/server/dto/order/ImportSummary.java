package com.example.server.dto.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportSummary {
    private int totalRows;
    private int parsedRows;
    private int importedRows;
    private int calculatedRows;
    private int failedRows;
    private int skippedDuplicateRows;
    private int outOfScopeRows;
}
