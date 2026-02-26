"use client";

import { AxiosError } from "axios";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import type { OrderResponse } from "../../types/order.types";

const STATUS_LABELS: Record<OrderResponse["status"], string> = {
  CALCULATED: "Calculated",
  OUT_OF_SCOPE: "Out of scope",
  FAILED_VALIDATION: "Validation failed",
  ADDED: "Added",
  PROCESSING: "Processing",
};

const STATUS_VARIANTS: Record<OrderResponse["status"], "default" | "secondary" | "destructive"> = {
  CALCULATED: "default",
  OUT_OF_SCOPE: "secondary",
  FAILED_VALIDATION: "destructive",
  ADDED: "secondary",
  PROCESSING: "default",
};

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

function formatRate(value: number): string {
  return `${(value * 100).toFixed(4)} %`;
}

function ResultRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className={`text-sm ${bold ? "font-medium" : "text-muted-foreground"}`}>{label}</span>
      <span className={`text-sm tabular-nums ${bold ? "font-semibold" : ""}`}>{value}</span>
    </div>
  );
}

interface ManualOrderResultProps {
  data: OrderResponse | undefined;
  error: Error | null;
  isPending: boolean;
  isIdle: boolean;
}

export function ManualOrderResult({ data, error, isPending, isIdle }: ManualOrderResultProps) {
  if (isIdle) {
    return (
      <Card className="flex h-full flex-col">
        <CardContent className="flex flex-1 items-center justify-center py-12 text-center">
          <p className="text-muted-foreground text-sm">
            Fill the form and submit to see tax breakdown.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isPending) {
    return (
      <Card className="flex h-full flex-col">
        <CardContent className="flex flex-1 flex-col items-center gap-3 py-12">
          <div className="border-primary size-6 animate-spin rounded-full border-2 border-t-transparent" />
          <p className="text-muted-foreground text-sm">Calculating&hellip;</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    const message =
      error instanceof AxiosError
        ? (error.response?.data?.message ?? error.message)
        : error.message;

    return (
      <Card className="flex h-full flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Result</span>
            <Badge variant="destructive">Error</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-destructive text-sm">{message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Result</span>
          <Badge variant={STATUS_VARIANTS[data.status]}>{STATUS_LABELS[data.status]}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div>
          <ResultRow label="Order ID" value={`#${data.id}`} />
          <ResultRow label="Created at" value={new Date(data.createdAt).toLocaleString()} />
        </div>

        <Separator />

        <div>
          <p className="mb-1 text-sm font-medium">Tax breakdown</p>
          <ResultRow
            label={`State (${data.jurisdictions.state})`}
            value={formatRate(data.stateRate)}
          />
          <ResultRow
            label={`County (${data.jurisdictions.county})`}
            value={formatRate(data.countyRate)}
          />
          <ResultRow
            label={`City (${data.jurisdictions.city})`}
            value={formatRate(data.cityRate)}
          />
          {data.specialRates.map((sr) => (
            <ResultRow key={sr.name} label={sr.name} value={formatRate(sr.rate)} />
          ))}
          <ResultRow label="Composite rate" bold value={formatRate(data.compositeTaxRate)} />
        </div>

        <Separator />

        <div className="rounded-lg border bg-muted/40 px-3 py-2">
          <ResultRow label="Tax amount" value={formatCurrency(data.taxAmount)} />
          <ResultRow label="Subtotal" value={formatCurrency(data.subtotal)} />
          <Separator />
          <ResultRow label="Total" value={formatCurrency(data.totalAmount)} bold />
        </div>
      </CardContent>
    </Card>
  );
}
