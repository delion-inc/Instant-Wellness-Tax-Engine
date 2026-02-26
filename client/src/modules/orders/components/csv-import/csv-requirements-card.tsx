"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";

const REQUIRED_COLUMNS = [
  { name: "id", description: "Unique order identifier" },
  { name: "longitude", description: "-180 to 180" },
  { name: "latitude", description: "-90 to 90" },
  { name: "timestamp", description: "ISO 8601 format" },
  { name: "subtotal", description: "Positive number" },
] as const;

const COMMON_ISSUES = [
  "Missing or misspelled column headers",
  "Coordinates outside valid range (lat: -90..90, lon: -180..180)",
  "Timestamp not in ISO 8601 format",
  "Subtotal contains non-numeric characters or is negative",
] as const;

export function CsvRequirementsCard() {
  return (
    <Card className="flex h-full flex-col bg-card">
      <CardHeader>
        <CardTitle>CSV requirements</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Required columns */}
        <div>
          <p className="mb-2 text-sm font-medium">Required columns</p>
          <div className="space-y-1.5">
            {REQUIRED_COLUMNS.map((col) => (
              <div key={col.name} className="flex items-baseline gap-2 text-sm">
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                  {col.name}
                </code>
                <span className="text-muted-foreground text-xs">
                  {col.description}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Timestamp format */}
        <div>
          <p className="mb-1.5 text-sm font-medium">Timestamp format</p>
          <p className="text-muted-foreground text-xs">
            ISO 8601 &mdash;{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
              YYYY-MM-DDTHH:mm:ssZ
            </code>
          </p>
        </div>

        <Separator />

        {/* Example row */}
        <div>
          <p className="mb-1.5 text-sm font-medium">Example row</p>
          <div className="overflow-x-auto rounded-md bg-muted px-3 py-2">
            <code className="whitespace-nowrap text-xs leading-relaxed">
              1001,-74.006,40.7128,2025-06-15T14:30:00Z,49.99
            </code>
          </div>
        </div>

        <Separator />

        {/* Common issues */}
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <HugeiconsIcon
              icon={Alert02Icon}
              className="size-4 text-muted-foreground"
            />
            <p className="text-sm font-medium">Common issues</p>
          </div>
          <ul className="space-y-1 text-muted-foreground text-xs list-disc pl-4">
            {COMMON_ISSUES.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
