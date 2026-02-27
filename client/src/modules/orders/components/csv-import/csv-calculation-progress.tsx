"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { CalculatorIcon, MapsLocation01Icon, TimeQuarter02Icon } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { CalculationProgressEvent, ImportResponse } from "../../types/order.types";

function ProgressStat({
  icon,
  label,
  value,
  iconClass,
}: {
  icon: typeof CalculatorIcon;
  label: string;
  value: number;
  iconClass: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border bg-muted/40 px-3 py-2.5">
      <div className={`flex size-8 shrink-0 items-center justify-center rounded-md ${iconClass}`}>
        <HugeiconsIcon icon={icon} className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-semibold tabular-nums leading-tight">{value.toLocaleString()}</p>
        <p className="text-muted-foreground text-xs">{label}</p>
      </div>
    </div>
  );
}

interface CsvCalculationProgressProps {
  importResult: ImportResponse;
  progress: CalculationProgressEvent | null;
}

export function CsvCalculationProgress({ importResult, progress }: CsvCalculationProgressProps) {
  const total = progress?.total ?? importResult.summary.importedRows;
  const calculated = progress?.calculated ?? 0;
  const percent = total > 0 ? Math.round((calculated / total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculating taxes&hellip;</CardTitle>
        <p className="text-muted-foreground text-sm">
          Imported {importResult.summary.importedRows.toLocaleString()} of{" "}
          {importResult.summary.totalRows.toLocaleString()} rows. Running tax calculations&hellip;
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {progress ? "Processing…" : "Connecting…"}
            </span>
            <span className="font-medium tabular-nums">{percent}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            {progress ? (
              <div
                className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${percent}%` }}
              />
            ) : (
              <div className="bg-primary h-full w-1/3 animate-[indeterminate_1.5s_ease-in-out_infinite] rounded-full" />
            )}
          </div>
        </div>

        {progress && (
          <div className="grid grid-cols-3 gap-3">
            <ProgressStat
              icon={CalculatorIcon}
              label="Calculated"
              value={progress.calculated}
              iconClass="bg-emerald-500/10 text-emerald-500"
            />
            <ProgressStat
              icon={MapsLocation01Icon}
              label="Out of scope"
              value={progress.outOfScope}
              iconClass="bg-amber-500/10 text-amber-500"
            />
            <ProgressStat
              icon={TimeQuarter02Icon}
              label="Pending"
              value={progress.pending}
              iconClass="bg-blue-500/10 text-blue-500"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
