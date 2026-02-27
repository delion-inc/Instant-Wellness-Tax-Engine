"use client";

import { BackLink } from "@/shared/components/back-link";
import { useCreateOrder } from "../../hooks/use-create-order";
import { ManualOrderForm } from "./manual-order-form";
import { ManualOrderResult } from "./manual-order-result";

export function ManualOrderPage() {
  const mutation = useCreateOrder();

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 md:gap-8 md:px-6 md:py-8">
      <div className="space-y-3">
        <BackLink href="/orders/new">Back to Add orders</BackLink>

        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Add order manually
          </h2>
          <p className="text-muted-foreground text-sm">
            Enter the order details and we&apos;ll calculate composite sales tax
            and breakdown.
          </p>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_1fr]">
        <ManualOrderForm
          onSubmit={(data) => mutation.mutate(data)}
          isPending={mutation.isPending}
        />
        <ManualOrderResult
          data={mutation.data}
          error={mutation.error}
          isPending={mutation.isPending}
          isIdle={mutation.isIdle}
        />
      </div>
    </div>
  );
}
