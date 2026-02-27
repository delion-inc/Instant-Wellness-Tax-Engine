package com.example.server.repository;

import com.example.server.entity.ImportBatch;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImportBatchRepository extends JpaRepository<ImportBatch, String> {
}
