"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AxiosError } from "axios";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  Alert02Icon,
  CancelCircleIcon,
  Download04Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { ordersApi } from "../../api/orders.api";
import type { ImportErrorReason, ImportResponse, ImportStatus } from "../../types/order.types";

type ResultStatus = "success" | "warning" | "error";

function mapStatus(status: ImportStatus): ResultStatus {
  if (status === "COMPLETED") return "success";
  if (status === "COMPLETED_WITH_ERRORS") return "warning";
  return "error";
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
  warning: "Import completed with some issues. Review the summary and errors below.",
  error: "The import failed. Please check the error details and try again.",
};

const REASON_LABELS: Record<ImportErrorReason, string> = {
  MISSING_COLUMN: "Missing column",
  BAD_FORMAT: "Bad format",
  INVALID_TIMESTAMP: "Invalid timestamp",
  INVALID_COORDINATES: "Invalid coordinates",
  OUT_OF_SCOPE: "Out of scope",
  NEGATIVE_SUBTOTAL: "Negative subtotal",
  DUPLICATE_EXTERNAL_ID: "Duplicate ID",
  CALCULATION_FAILED: "Calc failed",
  UNKNOWN: "Unknown",
};

const REASON_VARIANT: Record<
  ImportErrorReason,
  "default" | "secondary" | "destructive" | "outline"
> = {
  MISSING_COLUMN: "destructive",
  BAD_FORMAT: "destructive",
  INVALID_TIMESTAMP: "destructive",
  INVALID_COORDINATES: "destructive",
  OUT_OF_SCOPE: "secondary",
  NEGATIVE_SUBTOTAL: "destructive",
  DUPLICATE_EXTERNAL_ID: "outline",
  CALCULATION_FAILED: "destructive",
  UNKNOWN: "outline",
};

function StatBlock({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: number;
  variant?: "default" | "danger" | "warning";
}) {
  const valueClass =
    variant === "danger" && value > 0
      ? "text-destructive"
      : variant === "warning" && value > 0
        ? "text-amber-500"
        : "";

  return (
    <div className="rounded-lg border bg-muted/40 px-4 py-3 text-center">
      <p className={`text-2xl font-semibold tabular-nums ${valueClass}`}>
        {value.toLocaleString()}
      </p>
      <p className="text-muted-foreground mt-1 text-xs">{label}</p>
    </div>
  );
}

interface CsvImportResultProps {
  data: ImportResponse | undefined;
  error: Error | null;
  onReset: () => void;
}

export function CsvImportResult({ data, error, onReset }: CsvImportResultProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorsPage, setErrorsPage] = useState(1);

  const ERRORS_PAGE_SIZE = 10;

  useEffect(() => {
    setErrorsPage(1);
  }, [data?.errorsPreview]);

  const handleDownloadErrors = useCallback(async () => {
    if (!data?.trackingId) return;
    setIsDownloading(true);
    try {
      await ordersApi.downloadImportErrors(data.trackingId);
    } finally {
      setIsDownloading(false);
    }
  }, [data?.trackingId]);

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

  const status = mapStatus(data.status);
  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;
  const { summary, errorsPreview } = data;

  const errorsTotalPages = Math.ceil(errorsPreview.length / ERRORS_PAGE_SIZE);
  const errorsSlice = errorsPreview.slice(
    (errorsPage - 1) * ERRORS_PAGE_SIZE,
    errorsPage * ERRORS_PAGE_SIZE,
  );
  const errorsRangeStart = (errorsPage - 1) * ERRORS_PAGE_SIZE + 1;
  const errorsRangeEnd = Math.min(errorsPage * ERRORS_PAGE_SIZE, errorsPreview.length);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Import result</span>
          <Badge variant={config.badgeVariant}>{config.label}</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="flex items-start gap-3">
          <HugeiconsIcon icon={StatusIcon} className={`size-5 shrink-0 ${config.iconClass}`} />
          <p className="text-sm">{STATUS_DESCRIPTION[status]}</p>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatBlock label="Total rows" value={summary.totalRows} />
          <StatBlock label="Parsed" value={summary.parsedRows} />
          <StatBlock label="Imported" value={summary.importedRows} />
          <StatBlock label="Tax calculated" value={summary.calculatedRows} />
          <StatBlock label="Failed" value={summary.failedRows} variant="danger" />
          <StatBlock
            label="Skipped duplicates"
            value={summary.skippedDuplicateRows}
            variant="warning"
          />
          <StatBlock label="Out of scope" value={summary.outOfScopeRows} variant="warning" />
        </div>

        {data.message && (
          <>
            <Separator />
            <p className="text-muted-foreground text-sm">{data.message}</p>
          </>
        )}

        {errorsPreview.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  Error details
                  <span className="text-muted-foreground font-normal">
                    {" "}
                    &mdash;{" "}
                    {errorsPreview.length < summary.failedRows
                      ? `showing ${errorsPreview.length} of ${summary.failedRows.toLocaleString()}`
                      : `${errorsPreview.length.toLocaleString()} total`}
                  </span>
                </p>
                {summary.failedRows > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isDownloading}
                    onClick={handleDownloadErrors}
                  >
                    <HugeiconsIcon icon={Download04Icon} className="size-3.5" />
                    {isDownloading ? "Downloading…" : "Download CSV"}
                  </Button>
                )}
              </div>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row</TableHead>
                      <TableHead>External ID</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Field</TableHead>
                      <TableHead className="min-w-50">Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {errorsSlice.map((err, idx) => (
                      <TableRow key={`${err.rowNumber}-${idx}`}>
                        <TableCell className="tabular-nums">{err.rowNumber}</TableCell>
                        <TableCell className="tabular-nums">{err.externalId}</TableCell>
                        <TableCell>
                          <Badge variant={REASON_VARIANT[err.reason]}>
                            {REASON_LABELS[err.reason] ?? err.reason}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {err.field && (
                            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                              {err.field}
                            </code>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-75 truncate">
                          {err.message}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {errorsTotalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-xs tabular-nums">
                    {errorsRangeStart}–{errorsRangeEnd} of {errorsPreview.length.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="size-8 p-0"
                      disabled={errorsPage === 1}
                      onClick={() => setErrorsPage((p) => p - 1)}
                    >
                      <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
                    </Button>
                    <span className="text-muted-foreground min-w-16 text-center text-xs tabular-nums">
                      {errorsPage} / {errorsTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="size-8 p-0"
                      disabled={errorsPage === errorsTotalPages}
                      onClick={() => setErrorsPage((p) => p + 1)}
                    >
                      <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex-col gap-2 sm:flex-row">
        <Button size="lg" className="w-full sm:max-w-37.5" asChild>
          <Link href="/orders">View orders</Link>
        </Button>
        <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={onReset}>
          Import another file
        </Button>
      </CardFooter>
    </Card>
  );
}
