"use client";

import Link from "next/link";
import { AxiosError } from "axios";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  Alert02Icon,
  CancelCircleIcon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import type { ImportCsvResponse } from "../../types/order.types";

type ResultStatus = "success" | "warning" | "error";

function deriveStatus(data: ImportCsvResponse): ResultStatus {
  if (data.imported === 0) return "error";
  if (data.calculated === data.imported) return "success";
  return "warning";
}

const STATUS_CONFIG: Record<
  ResultStatus,
  {
    label: string;
    badgeVariant: "default" | "secondary" | "destructive";
    icon: typeof CheckmarkCircle02Icon;
    iconClass: string;
  }
> = {
  success: {
    label: "Success",
    badgeVariant: "default",
    icon: CheckmarkCircle02Icon,
    iconClass: "text-emerald-500",
  },
  warning: {
    label: "Partial success",
    badgeVariant: "secondary",
    icon: Alert02Icon,
    iconClass: "text-amber-500",
  },
  error: {
    label: "Failed",
    badgeVariant: "destructive",
    icon: CancelCircleIcon,
    iconClass: "text-destructive",
  },
};

const STATUS_DESCRIPTION: Record<ResultStatus, string> = {
  success: "All orders were imported and tax was calculated successfully.",
  warning:
    "Some orders were imported but tax wasn\u2019t calculated for all of them. Check Orders and filter by status.",
  error:
    "No orders were imported. Please check your CSV format and try again.",
};

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 rounded-lg border bg-muted/40 px-4 py-3 text-center">
      <p className="text-3xl font-semibold tabular-nums">{value}</p>
      <p className="text-muted-foreground mt-1 text-xs">{label}</p>
    </div>
  );
}

interface CsvImportResultProps {
  data: ImportCsvResponse | undefined;
  error: Error | null;
  onReset: () => void;
}

export function CsvImportResult({
  data,
  error,
  onReset,
}: CsvImportResultProps) {
  if (error) {
    const message =
      error instanceof AxiosError
        ? (error.response?.data?.message ?? error.message)
        : error.message;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Import result</span>
            <Badge variant="destructive">Error</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-sm">{message}</p>
        </CardContent>
        <CardFooter className="gap-2">
          <Button onClick={onReset}>Try again</Button>
        </CardFooter>
      </Card>
    );
  }

  if (!data) return null;

  const status = deriveStatus(data);
  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Import result</span>
          <Badge variant={config.badgeVariant}>{config.label}</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Status icon + message */}
        <div className="flex items-start gap-3">
          <HugeiconsIcon
            icon={StatusIcon}
            className={`size-5 shrink-0 mt-0.5 ${config.iconClass}`}
          />
          <p className="text-sm">{STATUS_DESCRIPTION[status]}</p>
        </div>

        <Separator />

        {/* Stats */}
        <div className="flex gap-3">
          <StatBlock label="Imported orders" value={data.imported} />
          <StatBlock label="Tax calculated" value={data.calculated} />
        </div>

        {/* API message */}
        {data.message && (
          <>
            <Separator />
            <p className="text-muted-foreground text-sm">{data.message}</p>
          </>
        )}
      </CardContent>

      <CardFooter className="flex-col gap-2 sm:flex-row">
        <Button size="lg" className="w-full sm:max-w-[150px]" asChild>
          <Link href="/orders">View orders</Link>
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full sm:w-auto"
          onClick={onReset}
        >
          Import another file
        </Button>
      </CardFooter>
    </Card>
  );
}
