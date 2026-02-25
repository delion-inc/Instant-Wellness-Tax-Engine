"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BackLink } from "@/shared/components/back-link";
import { useImportCsv } from "../../hooks/use-import-csv";
import type { ImportCsvOptions } from "../../types/order.types";
import { CsvUploadCard } from "./csv-upload-card";
import { CsvRequirementsCard } from "./csv-requirements-card";
import { CsvImportResult } from "./csv-import-result";

const DEFAULT_OPTIONS: ImportCsvOptions = {
  duplicateHandling: "skip",
  outOfScopeHandling: "mark",
};

export function CsvImportPage() {
  const mutation = useImportCsv();
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<ImportCsvOptions>(DEFAULT_OPTIONS);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasResult = mutation.isSuccess || mutation.isError;

  useEffect(() => {
    if (mutation.isPending) {
      setElapsedSeconds(0);
      timerRef.current = setInterval(
        () => setElapsedSeconds((s) => s + 1),
        1000,
      );
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mutation.isPending]);

  const handleStartImport = useCallback(() => {
    if (!file) return;
    mutation.mutate({ file, options });
  }, [file, options, mutation]);

  const handleReset = useCallback(() => {
    mutation.reset();
    setFile(null);
    setOptions(DEFAULT_OPTIONS);
    setElapsedSeconds(0);
  }, [mutation]);

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 md:gap-8 md:px-6 md:py-8">
      <div className="space-y-3">
        <BackLink href="/dashboard/orders/new">Back to Add orders</BackLink>

        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Import orders (CSV)
          </h2>
          <p className="text-muted-foreground text-sm">
            Upload a CSV to bulk-create orders and calculate tax breakdown.
          </p>
        </div>
      </div>

      {hasResult ? (
        <div className="max-w-xl">
          <CsvImportResult
            data={mutation.data}
            error={mutation.error}
            onReset={handleReset}
          />
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
            elapsedSeconds={elapsedSeconds}
          />
          <CsvRequirementsCard />
        </div>
      )}
    </div>
  );
}
