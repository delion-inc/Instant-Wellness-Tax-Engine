package com.example.server.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "import_batches")
public class ImportBatch {

    @Id
    @Column(name = "tracking_id", length = 36)
    private String trackingId;

    @Column(name = "total_rows", nullable = false)
    private int totalRows;

    @Column(name = "parsed_rows", nullable = false)
    private int parsedRows;

    @Column(name = "imported_rows", nullable = false)
    private int importedRows;

    @Column(name = "skipped_duplicate_rows", nullable = false)
    private int skippedDuplicateRows;
}
