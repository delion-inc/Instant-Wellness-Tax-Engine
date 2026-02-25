"use client";

import { useCallback, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CloudUploadIcon,
  FileAttachmentIcon,
  Cancel01Icon,
  Download04Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type {
  DuplicateHandling,
  ImportCsvOptions,
  OutOfScopeHandling,
} from "../../types/order.types";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

interface CsvUploadCardProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  options: ImportCsvOptions;
  onOptionsChange: (options: ImportCsvOptions) => void;
  onStartImport: () => void;
  isPending: boolean;
  elapsedSeconds: number;
}

export function CsvUploadCard({
  file,
  onFileChange,
  options,
  onOptionsChange,
  onStartImport,
  isPending,
  elapsedSeconds,
}: CsvUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (f: File | undefined) => {
      if (!f) return;
      if (!f.name.endsWith(".csv")) return;
      onFileChange(f);
    },
    [onFileChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <Card className="flex h-full flex-col bg-card">
      <CardHeader>
        <CardTitle>Upload CSV</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 space-y-5">
        {/* Drop zone */}
        <div
          role="button"
          tabIndex={0}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isPending && inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!isPending) inputRef.current?.click();
            }
          }}
          className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
            isPending
              ? "pointer-events-none opacity-60"
              : "cursor-pointer hover:border-primary/40 hover:bg-accent/30"
          } ${isDragging ? "border-primary bg-primary/5" : "border-border"}`}
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <HugeiconsIcon icon={CloudUploadIcon} className="size-6" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Drag & drop your CSV here
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              or{" "}
              <span className="text-primary font-medium underline underline-offset-2">
                choose a file
              </span>
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
            disabled={isPending}
          />
        </div>

        {/* File preview */}
        {file && (
          <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <HugeiconsIcon icon={FileAttachmentIcon} className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-muted-foreground text-xs">
                {formatFileSize(file.size)}
              </p>
            </div>
            {!isPending && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileChange(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="text-muted-foreground hover:text-foreground shrink-0 rounded-md p-1 transition-colors"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
              </button>
            )}
          </div>
        )}

        {/* Importing state */}
        {isPending && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Importing&hellip;</span>
              <span className="tabular-nums text-muted-foreground">
                {formatElapsed(elapsedSeconds)}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="bg-primary h-full w-1/3 animate-[indeterminate_1.5s_ease-in-out_infinite] rounded-full" />
            </div>
          </div>
        )}

        {/* Import options */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="duplicate-handling" className="text-sm">
              Duplicate handling
            </Label>
            <Select
              value={options.duplicateHandling}
              onValueChange={(v) =>
                onOptionsChange({
                  ...options,
                  duplicateHandling: v as DuplicateHandling,
                })
              }
              disabled={isPending}
            >
              <SelectTrigger id="duplicate-handling" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="skip">Skip duplicates</SelectItem>
                <SelectItem value="overwrite">Overwrite</SelectItem>
                <SelectItem value="fail">Fail on duplicates</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="oos-handling" className="text-sm">
              Out-of-scope points
            </Label>
            <Select
              value={options.outOfScopeHandling}
              onValueChange={(v) =>
                onOptionsChange({
                  ...options,
                  outOfScopeHandling: v as OutOfScopeHandling,
                })
              }
              disabled={isPending}
            >
              <SelectTrigger id="oos-handling" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mark">Mark as out-of-scope</SelectItem>
                <SelectItem value="fail">Fail on out-of-scope</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-muted-foreground text-xs">
          Required columns: id, longitude, latitude, timestamp, subtotal
        </p>
      </CardContent>

      <CardFooter className="flex-col gap-2 sm:flex-row">
        <Button
          size="lg"
          disabled={!file || isPending}
          onClick={onStartImport}
          className="w-full sm:max-w-[160px]"
        >
          {isPending ? "Importing..." : "Start import"}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full sm:w-auto"
          asChild
        >
          <a href="/order-import-template.csv" download>
            <HugeiconsIcon icon={Download04Icon} className="size-4" />
            Download template
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
