"use client";

import { useCallback, useState } from "react";
import { BackLink } from "@/shared/components/back-link";
import { useImportCsv } from "../../hooks/use-import-csv";
import { useImportProgress } from "../../hooks/use-import-progress";
import { ordersApi } from "../../api/orders.api";
import type { ImportCsvOptions, ImportResponse } from "../../types/order.types";
import { CsvUploadCard } from "./csv-upload-card";
import { CsvRequirementsCard } from "./csv-requirements-card";
import { CsvCalculationProgress } from "./csv-calculation-progress";
import { CsvImportResult } from "./csv-import-result";

type Phase = "idle" | "uploading" | "calculating" | "result";

const DEFAULT_OPTIONS: ImportCsvOptions = {
  duplicateHandling: "skip",
  outOfScopeHandling: "mark",
};

function derivePhase(
  isPending: boolean,
  importResult: ImportResponse | null,
  calculationDone: boolean,
  hasError: boolean,
): Phase {
  if (hasError) return "result";
  if (isPending) return "uploading";
  if (importResult && !calculationDone) {
    const needsCalculation =
      importResult.summary.importedRows > 0 &&
      importResult.status !== "FAILED" &&
      importResult.status !== "COMPLETED" &&
      importResult.status !== "COMPLETED_WITH_ERRORS";
    return needsCalculation ? "calculating" : "result";
  }
  if (importResult && calculationDone) return "result";
  return "idle";
}

export function CsvImportPage() {
  const mutation = useImportCsv();
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<ImportCsvOptions>(DEFAULT_OPTIONS);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);
  const [calculationDone, setCalculationDone] = useState(false);

  const trackingId = importResult?.trackingId ?? null;

  const { progress } = useImportProgress({
    trackingId: calculationDone ? null : trackingId,
    onComplete: useCallback(async () => {
      if (trackingId) {
        try {
          const summary = await ordersApi.getImportSummary(trackingId);
          setImportResult(summary);
        } catch {
          // fall through — keep the original importResult
        }
      }
      setCalculationDone(true);
    }, [trackingId]),
  });

  const phase = derivePhase(mutation.isPending, importResult, calculationDone, mutation.isError);

  const handleStartImport = useCallback(() => {
    if (!file) return;
    setCalculationDone(false);
    setImportResult(null);
    mutation.mutate(
      { file, options },
      {
        onSuccess: (data) => {
          setImportResult(data);
          const needsCalculation =
            data.summary.importedRows > 0 &&
            data.status !== "FAILED" &&
            data.status !== "COMPLETED" &&
            data.status !== "COMPLETED_WITH_ERRORS";
          if (!needsCalculation) {
            setCalculationDone(true);
          }
        },
        onError: () => {
          setCalculationDone(true);
        },
      },
    );
  }, [file, options, mutation]);

  const handleReset = useCallback(() => {
    mutation.reset();
    setFile(null);
    setOptions(DEFAULT_OPTIONS);
    setImportResult(null);
    setCalculationDone(false);
  }, [mutation]);

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 md:gap-8 md:px-6 md:py-8">
      <div className="space-y-3">
        <BackLink href="/orders/new">Back to Add orders</BackLink>

        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Import orders (CSV)</h2>
          <p className="text-muted-foreground text-sm">
            Upload a CSV to bulk-create orders and calculate tax breakdown.
          </p>
        </div>
      </div>

      {phase === "result" ? (
        <div className="mx-auto w-full max-w-7xl">
          <CsvImportResult
            data={importResult ?? undefined}
            error={mutation.error}
            onReset={handleReset}
          />
        </div>
      ) : phase === "calculating" && importResult ? (
        <div className="mx-auto w-full max-w-7xl">
          <CsvCalculationProgress importResult={importResult} progress={progress} />
        </div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_1fr]">
          <CsvUploadCard
            file={file}
            onFileChange={setFile}
            options={options}
            onOptionsChange={setOptions}
            onStartImport={handleStartImport}
            isPending={mutation.isPending}
          />
          <CsvRequirementsCard />
        </div>
      )}
    </div>
  );
}
