"use client";

import { useState, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Slider } from "@/shared/components/ui/slider";
import { Separator } from "@/shared/components/ui/separator";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, Calendar03Icon } from "@hugeicons/core-free-icons";
import { endOfDay, format, startOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import type { useOrderFilters } from "../../hooks/use-order-filters";

const TAX_AMOUNT_MIN_BOUND = 0;
const TAX_AMOUNT_MAX_BOUND = 10000;
const TAX_RATE_MIN_BOUND = 0;
const TAX_RATE_MAX_BOUND = 0.25;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

interface DraftState {
  csvImported: boolean | null;
  timestampFrom: string | null;
  timestampTo: string | null;
  taxAmountMin: number | null;
  taxAmountMax: number | null;
  compositeTaxRateMin: number | null;
  compositeTaxRateMax: number | null;
  jurState: string | null;
  jurCounty: string | null;
  jurCity: string | null;
  jurSpecial: string | null;
  hasSpecial: boolean | null;
}

function buildDraft(
  params: ReturnType<typeof useOrderFilters>["params"],
): DraftState {
  return {
    csvImported: params.csvImported,
    timestampFrom: params.timestampFrom,
    timestampTo: params.timestampTo,
    taxAmountMin: params.taxAmountMin,
    taxAmountMax: params.taxAmountMax,
    compositeTaxRateMin: params.compositeTaxRateMin,
    compositeTaxRateMax: params.compositeTaxRateMax,
    jurState: params.jurState,
    jurCounty: params.jurCounty,
    jurCity: params.jurCity,
    jurSpecial: params.jurSpecial,
    hasSpecial: params.hasSpecial,
  };
}

const EMPTY_DRAFT: DraftState = {
  csvImported: null,
  timestampFrom: null,
  timestampTo: null,
  taxAmountMin: null,
  taxAmountMax: null,
  compositeTaxRateMin: null,
  compositeTaxRateMax: null,
  jurState: null,
  jurCounty: null,
  jurCity: null,
  jurSpecial: null,
  hasSpecial: null,
};

interface OrdersFilterSheetProps {
  filters: ReturnType<typeof useOrderFilters>;
  onOpenChange: (open: boolean) => void;
}

export function OrdersFilterSheet({
  filters,
  onOpenChange,
}: OrdersFilterSheetProps) {
  const { params, setFilters } = filters;
  const [draft, setDraft] = useState<DraftState>(() => buildDraft(params));
  const [isJurisdictionOpen, setIsJurisdictionOpen] = useState(false);

  const updateDraft = useCallback(
    <K extends keyof DraftState>(key: K, value: DraftState[K]) => {
      setDraft((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleApply = useCallback(() => {
    setFilters(draft);
    onOpenChange(false);
  }, [draft, setFilters, onOpenChange]);

  const handleClear = useCallback(() => {
    setDraft(EMPTY_DRAFT);
    onOpenChange(false);
  }, []);

  const selectedDateRange: DateRange | undefined =
    draft.timestampFrom || draft.timestampTo
      ? {
          from: draft.timestampFrom ? new Date(draft.timestampFrom) : undefined,
          to: draft.timestampTo ? new Date(draft.timestampTo) : undefined,
        }
      : undefined;

  const taxAmountMinValue = draft.taxAmountMin ?? TAX_AMOUNT_MIN_BOUND;
  const taxAmountMaxValue = draft.taxAmountMax ?? TAX_AMOUNT_MAX_BOUND;
  const taxRateMinValue = draft.compositeTaxRateMin ?? TAX_RATE_MIN_BOUND;
  const taxRateMaxValue = draft.compositeTaxRateMax ?? TAX_RATE_MAX_BOUND;

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col sm:max-w-2xl! !w-full">
        <SheetHeader className="pb-0">
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            Narrow down orders by source, date, amounts, and jurisdiction.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          <div className="flex flex-col gap-6 py-2">
            {/* Date range */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-medium">Date Range</h4>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start px-2.5 font-normal"
                  >
                    <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} />
                    {selectedDateRange?.from ? (
                      selectedDateRange.to ? (
                        <>
                          {format(selectedDateRange.from, "LLL dd, y")} -{" "}
                          {format(selectedDateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(selectedDateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    numberOfMonths={2}
                    defaultMonth={selectedDateRange?.from}
                    selected={selectedDateRange}
                    onSelect={(range) => {
                      updateDraft(
                        "timestampFrom",
                        range?.from ? startOfDay(range.from).toISOString() : null,
                      );
                      updateDraft(
                        "timestampTo",
                        range?.to ? endOfDay(range.to).toISOString() : null,
                      );
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Separator />

            {/* Tax amount range */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-medium">Tax Amount Range</h4>
              <Slider
                min={TAX_AMOUNT_MIN_BOUND}
                max={TAX_AMOUNT_MAX_BOUND}
                step={1}
                value={[taxAmountMinValue, taxAmountMaxValue]}
                onValueChange={([min, max]) => {
                  updateDraft("taxAmountMin", min);
                  updateDraft("taxAmountMax", max);
                }}
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-muted-foreground text-xs">Min</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={draft.taxAmountMin ?? ""}
                    onChange={(e) =>
                      updateDraft("taxAmountMin", e.target.value ? parseFloat(e.target.value) : null)
                    }
                    onBlur={(e) => {
                      if (!e.target.value) return;
                      const nextMin = clamp(
                        parseFloat(e.target.value),
                        TAX_AMOUNT_MIN_BOUND,
                        taxAmountMaxValue,
                      );
                      updateDraft("taxAmountMin", nextMin);
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-muted-foreground text-xs">Max</Label>
                  <Input
                    type="number"
                    placeholder="999.99"
                    value={draft.taxAmountMax ?? ""}
                    onChange={(e) =>
                      updateDraft("taxAmountMax", e.target.value ? parseFloat(e.target.value) : null)
                    }
                    onBlur={(e) => {
                      if (!e.target.value) return;
                      const nextMax = clamp(
                        parseFloat(e.target.value),
                        taxAmountMinValue,
                        TAX_AMOUNT_MAX_BOUND,
                      );
                      updateDraft("taxAmountMax", nextMax);
                    }}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Tax rate range */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-medium">Tax Rate Range (%)</h4>
              <Slider
                min={TAX_RATE_MIN_BOUND}
                max={TAX_RATE_MAX_BOUND}
                step={0.0001}
                value={[taxRateMinValue, taxRateMaxValue]}
                onValueChange={([min, max]) => {
                  updateDraft("compositeTaxRateMin", min);
                  updateDraft("compositeTaxRateMax", max);
                }}
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-muted-foreground text-xs">Min %</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={
                      draft.compositeTaxRateMin !== null
                        ? (draft.compositeTaxRateMin * 100).toFixed(2)
                        : ""
                    }
                    onChange={(e) =>
                      updateDraft(
                        "compositeTaxRateMin",
                        e.target.value
                          ? parseFloat(e.target.value) / 100
                          : null,
                      )
                    }
                    onBlur={(e) => {
                      if (!e.target.value) return;
                      const nextMin = clamp(
                        parseFloat(e.target.value) / 100,
                        TAX_RATE_MIN_BOUND,
                        taxRateMaxValue,
                      );
                      updateDraft("compositeTaxRateMin", nextMin);
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-muted-foreground text-xs">Max %</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="100"
                    value={
                      draft.compositeTaxRateMax !== null
                        ? (draft.compositeTaxRateMax * 100).toFixed(2)
                        : ""
                    }
                    onChange={(e) =>
                      updateDraft(
                        "compositeTaxRateMax",
                        e.target.value
                          ? parseFloat(e.target.value) / 100
                          : null,
                      )
                    }
                    onBlur={(e) => {
                      if (!e.target.value) return;
                      const nextMax = clamp(
                        parseFloat(e.target.value) / 100,
                        taxRateMinValue,
                        TAX_RATE_MAX_BOUND,
                      );
                      updateDraft("compositeTaxRateMax", nextMax);
                    }}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Jurisdiction */}
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                variant="ghost"
                className="justify-between px-0 pr-3 py-0 hover:bg-transparent"
                onClick={() => setIsJurisdictionOpen((prev) => !prev)}
              >
                <h4 className="text-sm font-medium">Jurisdiction</h4>
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  strokeWidth={2}
                  className={`size-4 transition-transform ${
                    isJurisdictionOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>
              {isJurisdictionOpen && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-muted-foreground text-xs">State</Label>
                      <Input
                        placeholder="e.g. New York State"
                        value={draft.jurState ?? ""}
                        onChange={(e) =>
                          updateDraft("jurState", e.target.value || null)
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-muted-foreground text-xs">
                        County
                      </Label>
                      <Input
                        placeholder="e.g. New York County"
                        value={draft.jurCounty ?? ""}
                        onChange={(e) =>
                          updateDraft("jurCounty", e.target.value || null)
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-muted-foreground text-xs">City</Label>
                      <Input
                        placeholder="e.g. New York City"
                        value={draft.jurCity ?? ""}
                        onChange={(e) =>
                          updateDraft("jurCity", e.target.value || null)
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-muted-foreground text-xs">
                        Special district
                      </Label>
                      <Input
                        placeholder="e.g. MCTD"
                        value={draft.jurSpecial ?? ""}
                        onChange={(e) =>
                          updateDraft("jurSpecial", e.target.value || null)
                        }
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <Separator />

            {/* Toggle filters */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-medium">Additional Filters</h4>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex flex-col">
                  <Label htmlFor="csv-only-switch" className="text-sm">
                    CSV imports only
                  </Label>
                  <span className="text-muted-foreground text-xs">
                    Show only imported CSV orders.
                  </span>
                </div>
                <Switch
                  id="csv-only-switch"
                  checked={draft.csvImported === true}
                  onCheckedChange={(checked) =>
                    updateDraft("csvImported", checked ? true : null)
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex flex-col">
                  <Label htmlFor="has-special-switch" className="text-sm">
                    Has special district
                  </Label>
                  <span className="text-muted-foreground text-xs">
                    Keep orders that include special jurisdiction.
                  </span>
                </div>
                <Switch
                  id="has-special-switch"
                  checked={draft.hasSpecial === true}
                  onCheckedChange={(checked) =>
                    updateDraft("hasSpecial", checked ? true : null)
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="border-t pt-4">
          <Button variant="outline" onClick={handleClear}>
            Clear filters
          </Button>
          <Button onClick={handleApply}>
            Apply filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
