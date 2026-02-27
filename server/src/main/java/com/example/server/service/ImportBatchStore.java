package com.example.server.service;

import com.example.server.dto.order.ImportRowError;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class ImportBatchStore {

    private static final int MAX_BATCHES = 500;

    private final Map<String, List<ImportRowError>> store = Collections.synchronizedMap(
            new LinkedHashMap<>(256, 0.75f, false) {
                @Override
                protected boolean removeEldestEntry(Map.Entry<String, List<ImportRowError>> eldest) {
                    return size() > MAX_BATCHES;
                }
            });

    public void save(String batchId, List<ImportRowError> errors) {
        store.put(batchId, new ArrayList<>(errors));
    }

    public void appendErrors(String batchId, List<ImportRowError> errors) {
        store.computeIfPresent(batchId, (k, existing) -> {
            existing.addAll(errors);
            return existing;
        });
    }

    public List<ImportRowError> get(String batchId) {
        return store.get(batchId);
    }

    public boolean exists(String batchId) {
        return store.containsKey(batchId);
    }
}
