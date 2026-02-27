"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { ordersApi } from "../api/orders.api";
import type { CalculationProgressEvent } from "../types/order.types";

interface UseImportProgressOptions {
  trackingId: string | null;
  onComplete?: (event: CalculationProgressEvent) => void;
}

export function useImportProgress({ trackingId, onComplete }: UseImportProgressOptions) {
  const [progress, setProgress] = useState<CalculationProgressEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const reset = useCallback(() => {
    setProgress(null);
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (!trackingId) {
      return;
    }

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const url = ordersApi.getImportProgressUrl(trackingId);

    fetchEventSource(url, {
      signal: ctrl.signal,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      onopen: async (response) => {
        if (response.ok) {
          setIsConnected(true);
          return;
        }
        throw new Error(`SSE connection failed: ${response.status}`);
      },
      onmessage: (event) => {
        if (event.event !== "progress") return;

        const data = JSON.parse(event.data) as CalculationProgressEvent;
        setProgress(data);

        if (data.terminal) {
          onCompleteRef.current?.(data);
        }
      },
      onerror: () => {
        setIsConnected(false);
      },
      openWhenHidden: true,
    });

    return () => {
      ctrl.abort();
      abortRef.current = null;
      reset();
    };
  }, [trackingId, reset]);

  return { progress, isConnected };
}
