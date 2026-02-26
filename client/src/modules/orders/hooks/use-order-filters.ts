"use client";

import { useQueryStates, parseAsInteger, parseAsFloat, parseAsBoolean, parseAsString } from "nuqs";
import { useCallback, useMemo } from "react";
import type { OrderFilterParams } from "../types/order.types";

const filterParsers = {
  search: parseAsString,
  status: parseAsString,
  csvImported: parseAsBoolean,

  timestampFrom: parseAsString,
  timestampTo: parseAsString,

  taxAmountMin: parseAsFloat,
  taxAmountMax: parseAsFloat,
  compositeTaxRateMin: parseAsFloat,
  compositeTaxRateMax: parseAsFloat,

  jurState: parseAsString,
  jurCounty: parseAsString,
  jurCity: parseAsString,
  jurSpecial: parseAsString,
  hasSpecial: parseAsBoolean,

  page: parseAsInteger.withDefault(0),
  pageSize: parseAsInteger.withDefault(25),
  sort: parseAsString.withDefault("createdAt,desc"),
};

export function useOrderFilters() {
  const [params, setParams] = useQueryStates(filterParsers, {
    shallow: false,
  });

  type ParamValues = typeof params;

  const setFilter = useCallback(
    <K extends keyof ParamValues>(key: K, value: ParamValues[K]) => {
      setParams((prev) => ({ ...prev, [key]: value, page: 0 }));
    },
    [setParams],
  );

  const setFilters = useCallback(
    (updates: Partial<ParamValues>) => {
      setParams((prev) => ({ ...prev, ...updates, page: 0 }));
    },
    [setParams],
  );

  const setPagination = useCallback(
    (page: number, pageSize?: number) => {
      setParams((prev) => ({
        ...prev,
        page,
        ...(pageSize !== undefined ? { pageSize } : {}),
      }));
    },
    [setParams],
  );

  const currentSort = useMemo(() => {
    const parts = (params.sort ?? "createdAt,desc").split(",");
    return {
      field: parts[0] ?? "createdAt",
      direction: (parts[1] ?? "desc") as "asc" | "desc",
    };
  }, [params.sort]);

  const setSort = useCallback(
    (field: string, direction: "asc" | "desc" | null) => {
      setParams((prev) => ({
        ...prev,
        sort: direction ? `${field},${direction}` : null,
        page: 0,
      }));
    },
    [setParams],
  );

  const resetFilters = useCallback(() => {
    setParams((prev) => {
      const cleared = {} as Record<string, null>;
      for (const key of Object.keys(prev)) {
        cleared[key] = null;
      }
      return cleared as unknown as typeof prev;
    });
  }, [setParams]);

  const hasActiveFilters = useMemo(() => {
    const { page, pageSize, sort, ...filters } = params;
    return Object.values(filters).some((v) => v !== null && v !== undefined);
  }, [params]);

  const apiParams = useMemo((): OrderFilterParams => {
    const result: OrderFilterParams = {
      page: params.page,
      pageSize: params.pageSize,
      sort: params.sort,
      include: "details",
    };

    if (params.search) {
      const numVal = Number(params.search);
      if (!isNaN(numVal) && numVal > 0) {
        result.id = numVal;
      }
    }

    if (params.status && params.status !== "ALL") {
      result.status = params.status;
    }

    if (params.csvImported !== null) result.csvImported = params.csvImported;
    if (params.timestampFrom) result.timestampFrom = params.timestampFrom;
    if (params.timestampTo) result.timestampTo = params.timestampTo;
    if (params.taxAmountMin !== null) result.taxAmountMin = params.taxAmountMin;
    if (params.taxAmountMax !== null) result.taxAmountMax = params.taxAmountMax;
    if (params.compositeTaxRateMin !== null)
      result.compositeTaxRateMin = params.compositeTaxRateMin;
    if (params.compositeTaxRateMax !== null)
      result.compositeTaxRateMax = params.compositeTaxRateMax;
    if (params.jurState) result.jurState = params.jurState;
    if (params.jurCounty) result.jurCounty = params.jurCounty;
    if (params.jurCity) result.jurCity = params.jurCity;
    if (params.jurSpecial) result.jurSpecial = params.jurSpecial;
    if (params.hasSpecial !== null) result.hasSpecial = params.hasSpecial;

    return result;
  }, [params]);

  return {
    params,
    apiParams,
    currentSort,
    setFilter,
    setFilters,
    setSort,
    setPagination,
    resetFilters,
    hasActiveFilters,
  };
}
