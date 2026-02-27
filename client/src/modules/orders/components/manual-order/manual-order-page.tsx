"use client";

import { useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BackLink } from "@/shared/components/back-link";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useCreateOrder } from "../../hooks/use-create-order";
import { createOrderSchema, type CreateOrderFormValues } from "../../types/order.schemas";
import type { CreateOrderRequest } from "../../types/order.types";
import { ManualOrderForm } from "./manual-order-form";
import { ManualOrderResult } from "./manual-order-result";

const MapCoordinatePicker = dynamic(
  () => import("@/shared/components/mapbox").then((m) => m.MapCoordinatePicker),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full min-h-64 w-full rounded-xl lg:min-h-0" />,
  },
);

export function ManualOrderPage() {
  const mutation = useCreateOrder();
  const resultRef = useRef<HTMLDivElement>(null);

  const form = useForm<CreateOrderFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createOrderSchema as any),
    defaultValues: {
      latitude: "" as unknown as number,
      longitude: "" as unknown as number,
      date: undefined,
      subtotal: "",
    },
  });

  const watchedLat = form.watch("latitude");
  const watchedLng = form.watch("longitude");

  const mapCoordinates = useMemo(() => {
    const lat = Number(watchedLat);
    const lng = Number(watchedLng);
    if (!isNaN(lat) && !isNaN(lng) && String(watchedLat) !== "" && String(watchedLng) !== "") {
      return { latitude: lat, longitude: lng };
    }
    return null;
  }, [watchedLat, watchedLng]);

  const handleCoordinateSelect = (latitude: number, longitude: number) => {
    const roundedLat = Math.round(latitude * 1_000_000) / 1_000_000;
    const roundedLng = Math.round(longitude * 1_000_000) / 1_000_000;
    form.setValue("latitude", roundedLat, { shouldValidate: true });
    form.setValue("longitude", roundedLng, { shouldValidate: true });
  };

  useEffect(() => {
    if (!mutation.isIdle && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [mutation.isIdle, mutation.isPending, mutation.data, mutation.error]);

  const handleSubmit = (data: CreateOrderFormValues) => {
    const request: CreateOrderRequest = {
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: data.date ? data.date.toISOString() : new Date().toISOString(),
      subtotal: data.subtotal,
    };
    mutation.mutate(request);
  };

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 md:gap-8 md:px-6 md:py-8">
      <div className="space-y-3">
        <BackLink href="/orders/new">Back to Add orders</BackLink>

        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Add order manually</h2>
          <p className="text-muted-foreground text-sm">
            Enter the order details and we&apos;ll calculate composite sales tax and breakdown.
          </p>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="border-border h-64 overflow-hidden rounded-xl border sm:h-80 lg:sticky lg:top-20 lg:h-[calc(100vh-10rem)] lg:self-start">
          <MapCoordinatePicker
            coordinates={mapCoordinates}
            onCoordinateSelect={handleCoordinateSelect}
            className="h-full w-full"
          />
        </div>

        <div className="flex flex-col gap-6">
          <ManualOrderForm form={form} onSubmit={handleSubmit} isPending={mutation.isPending} />
          <ManualOrderResult
            ref={resultRef}
            data={mutation.data}
            error={mutation.error}
            isPending={mutation.isPending}
            isIdle={mutation.isIdle}
          />
        </div>
      </div>
    </div>
  );
}
