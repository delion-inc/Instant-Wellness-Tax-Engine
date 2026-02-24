"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Csv01Icon, MapPinIcon, Analytics01Icon } from "@hugeicons/core-free-icons";

const features = [
  {
    icon: Csv01Icon,
    title: "CSV Batch Processing",
    description: "Upload thousands of orders and calculate taxes in seconds",
  },
  {
    icon: MapPinIcon,
    title: "Real-time GPS Tax Mapping",
    description: "Pinpoint tax jurisdictions from drone delivery coordinates",
  },
  {
    icon: Analytics01Icon,
    title: "Order Analytics",
    description: "Track revenue, tax liabilities, and delivery performance",
  },
];

export function FeatureList() {
  return (
    <div className="grid gap-4">
      {features.map((feature) => (
        <div key={feature.title} className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <HugeiconsIcon icon={feature.icon} strokeWidth={1.5} className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{feature.title}</p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
