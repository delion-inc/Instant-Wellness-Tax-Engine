"use client";

import { useCallback, useState, useEffect } from "react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  Cancel01Icon,
  FilterIcon,
} from "@hugeicons/core-free-icons";
import { OrdersFilterSheet } from "./orders-filter-sheet";
import type { useOrderFilters } from "../../hooks/use-order-filters";

const STATUS_TABS = [
  { value: "ALL", label: "All" },
  { value: "CALCULATED", label: "Calculated" },
  { value: "OUT_OF_SCOPE", label: "Out of Scope" },
  { value: "FAILED_VALIDATION", label: "Failed" },
] as const;

interface OrdersFilterBarProps {
  filters: ReturnType<typeof useOrderFilters>;
}

export function OrdersFilterBar({
  filters,
}: OrdersFilterBarProps) {
  const { params, setFilter, resetFilters, hasActiveFilters } = filters;

  const [searchValue, setSearchValue] = useState(params.search ?? "");
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    setSearchValue(params.search ?? "");
  }, [params.search]);

  const handleSearchSubmit = useCallback(() => {
    setFilter("search", searchValue || null);
  }, [searchValue, setFilter]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSearchSubmit();
    },
    [handleSearchSubmit],
  );

  const advancedFilterCount = [
    params.csvImported !== null,
    !!params.timestampFrom,
    !!params.timestampTo,
    params.taxAmountMin !== null,
    params.taxAmountMax !== null,
    params.compositeTaxRateMin !== null,
    params.compositeTaxRateMax !== null,
    !!params.jurState,
    !!params.jurCounty,
    !!params.jurCity,
    !!params.jurSpecial,
    params.hasSpecial !== null,
  ].filter(Boolean).length;

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-[220px]">
            <HugeiconsIcon
              icon={Search01Icon}
              strokeWidth={2}
              className="text-muted-foreground absolute left-2.5 top-1/2 size-4 -translate-y-1/2"
            />
            <Input
              placeholder="Search by Order ID..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onBlur={handleSearchSubmit}
              className="pl-8 text-sm"
            />
          </div>

          <Tabs
            value={params.status ?? "ALL"}
            onValueChange={(val) =>
              setFilter("status", val === "ALL" ? null : val)
            }
            className="gap-0"
          >
            <TabsList className="h-8">
              {STATUS_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-xs px-2.5"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-muted-foreground"
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
              <span className="hidden sm:inline">Clear all</span>
            </Button>
          )}

          <Button onClick={() => setSheetOpen(true)}>
            <HugeiconsIcon icon={FilterIcon} strokeWidth={2} />
            More Filters
            {advancedFilterCount > 0 && (
              <span className="bg-primary-foreground text-primary ml-0.5 flex size-5 items-center justify-center rounded-full text-[11px] font-semibold">
                {advancedFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {sheetOpen && (
        <OrdersFilterSheet filters={filters} onOpenChange={setSheetOpen} />
      )}
    </>
  );
}
