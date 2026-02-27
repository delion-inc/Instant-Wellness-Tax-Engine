package com.example.server.service;

import com.example.server.dto.order.CalculationProgressEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class CalculationProgressStore {

    private static final long SSE_TIMEOUT_MS = 10 * 60 * 1000L;

    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final Map<String, CalculationProgressEvent> results = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String trackingId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);
        emitters.put(trackingId, emitter);
        emitter.onCompletion(() -> emitters.remove(trackingId));
        emitter.onTimeout(() -> emitters.remove(trackingId));
        emitter.onError(e -> emitters.remove(trackingId));

        CalculationProgressEvent cached = results.get(trackingId);
        if (cached != null) {
            send(emitter, trackingId, cached);
        }

        return emitter;
    }

    public void emit(String trackingId, CalculationProgressEvent event) {
        if (event.isTerminal()) {
            results.put(trackingId, event);
        }

        SseEmitter emitter = emitters.get(trackingId);
        if (emitter != null) {
            send(emitter, trackingId, event);
        }
    }

    public Optional<CalculationProgressEvent> getResult(String trackingId) {
        return Optional.ofNullable(results.get(trackingId));
    }

    public boolean hasTracking(String trackingId) {
        return emitters.containsKey(trackingId) || results.containsKey(trackingId);
    }

    private void send(SseEmitter emitter, String trackingId, CalculationProgressEvent event) {
        try {
            emitter.send(SseEmitter.event()
                    .name("progress")
                    .data(event));

            if (event.isTerminal()) {
                emitter.complete();
                emitters.remove(trackingId);
            }
        } catch (IOException e) {
            emitter.completeWithError(e);
            emitters.remove(trackingId);
        }
    }
}
