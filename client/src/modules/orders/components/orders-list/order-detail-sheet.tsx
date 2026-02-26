"use client";

import { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/shared/components/ui/sheet";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon } from "@hugeicons/core-free-icons";
import { OrderStatusBadge } from "./order-status-badge";
import type { MapMarker } from "@/shared/components/mapbox";
import type { OrderResponse } from "../../types/order.types";

const MapboxMap = dynamic(() => import("@/shared/components/mapbox").then((m) => m.MapboxMap), {
  ssr: false,
  loading: () => <Skeleton className="h-56 w-full rounded-lg" />,
});

interface OrderDetailSheetProps {
  order: OrderResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "-";
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatRate = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "-";
  return `${(value * 100).toFixed(4)}%`;
};

function DetailRow({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between py-1.5 ${className ?? ""}`}>
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export function OrderDetailSheet({ order, open, onOpenChange }: OrderDetailSheetProps) {
  const copyCoords = useCallback(() => {
    if (!order) return;
    navigator.clipboard.writeText(`${order.latitude}, ${order.longitude}`);
    toast.success("Coordinates copied");
  }, [order]);

  const mapCenter = useMemo<[number, number]>(
    () => [order?.longitude ?? 0, order?.latitude ?? 0],
    [order?.longitude, order?.latitude],
  );

  const mapMarkers = useMemo<MapMarker[]>(
    () => (order ? [{ coordinates: [order.longitude, order.latitude] }] : []),
    [order],
  );

  if (!order) return null;

  const jurisdictions = order.jurisdictions;
  const specialRates = order.specialRates ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-2xl! !w-full overflow-y-auto">
        <SheetHeader className="pb-0">
          <SheetTitle className="text-lg">Order #{order.id}</SheetTitle>
          <SheetDescription className="flex items-center gap-2">
            <span className="tabular-nums">
              {order.latitude}, {order.longitude}
            </span>
            <Button variant="ghost" size="icon" className="size-6" onClick={copyCoords}>
              <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} className="size-3.5" />
              <span className="sr-only">Copy coordinates</span>
            </Button>
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4 pb-6">
          {/* Location map */}
          <MapboxMap
            center={mapCenter}
            zoom={10}
            markers={mapMarkers}
            className="h-52 overflow-hidden rounded-lg border"
          />

          {/* Order overview */}
          <div>
            <h3 className="mb-2 text-sm font-semibold">Overview</h3>
            <div className="rounded-lg border p-3">
              <DetailRow label="Status" value={<OrderStatusBadge status={order.status} />} />
              <DetailRow
                label="Source"
                value={
                  <Badge variant="outline" className="text-muted-foreground">
                    {order.csvImported ? "CSV Import" : "Manual"}
                  </Badge>
                }
              />
              <DetailRow
                label="Timestamp"
                value={
                  order.timestamp ? format(new Date(order.timestamp), "MMM d, yyyy HH:mm:ss") : "-"
                }
              />
              <DetailRow label="Subtotal" value={formatCurrency(order.subtotal)} />
              <DetailRow
                label="Total"
                value={<span className="font-semibold">{formatCurrency(order.totalAmount)}</span>}
              />
            </div>
          </div>

          {/* Tax breakdown */}
          <div>
            <h3 className="mb-2 text-sm font-semibold">Tax Breakdown</h3>
            <div className="rounded-lg border p-3">
              <DetailRow label="Composite rate" value={formatRate(order.compositeTaxRate)} />
              <DetailRow label="Tax amount" value={formatCurrency(order.taxAmount)} />
              <Separator className="my-1.5" />
              <DetailRow label="State rate" value={formatRate(order.stateRate)} />
              <DetailRow label="County rate" value={formatRate(order.countyRate)} />
              <DetailRow label="City rate" value={formatRate(order.cityRate)} />
              {specialRates.length > 0 && (
                <>
                  <Separator className="my-1.5" />
                  <p className="text-muted-foreground mb-1">Special Districts</p>
                  {specialRates.map((sr) => (
                    <DetailRow key={sr.name} label={sr.name} value={formatRate(sr.rate)} />
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Jurisdictions */}
          {jurisdictions && (
            <div>
              <h3 className="mb-2 text-sm font-semibold">Jurisdictions</h3>
              <div className="rounded-lg border p-3">
                {jurisdictions.state && <DetailRow label="State" value={jurisdictions.state} />}
                {jurisdictions.county && <DetailRow label="County" value={jurisdictions.county} />}
                {jurisdictions.city && <DetailRow label="City" value={jurisdictions.city} />}
                {jurisdictions.special?.length > 0 && (
                  <>
                    <Separator className="my-1.5" />
                    <p className="text-muted-foreground mb-1">Special Districts</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {jurisdictions.special.map((s) => (
                        <Badge key={s} variant="secondary">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div>
            <h3 className="mb-2 text-sm font-semibold">Metadata</h3>
            <div className="rounded-lg border p-3">
              {order.externalId != null && (
                <DetailRow label="External ID" value={order.externalId} />
              )}
              <DetailRow
                label="Created"
                value={
                  order.createdAt ? format(new Date(order.createdAt), "MMM d, yyyy HH:mm") : "-"
                }
              />
              <DetailRow
                label="Updated"
                value={
                  order.updatedAt ? format(new Date(order.updatedAt), "MMM d, yyyy HH:mm") : "-"
                }
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
