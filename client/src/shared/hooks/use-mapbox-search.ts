"use client";

import { useEffect, useRef, useState } from "react";
import { searchPlaces, type GeocodingResult } from "@/shared/api/mapbox-geocoding";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 3;

export function useMapboxSearch(query: string) {
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.trim().length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const timeout = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const data = await searchPlaces(query.trim(), controller.signal);
        if (!controller.signal.aborted) {
          setResults(data);
          setIsLoading(false);
        }
      } catch {
        if (!controller.signal.aborted) {
          setResults([]);
          setIsLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timeout);
      abortRef.current?.abort();
    };
  }, [query]);

  return { results, isLoading };
}
