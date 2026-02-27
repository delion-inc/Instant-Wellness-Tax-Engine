package com.example.server.dto.order;

import com.example.server.enums.ImportErrorReason;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportRowError {
    private Integer rowNumber;
    private Long externalId;
    private ImportErrorReason reason;
    private String field;
    private String message;
    private String rawRow;
}
