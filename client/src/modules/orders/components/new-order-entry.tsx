"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Csv01Icon, PlusSignCircleIcon } from "@hugeicons/core-free-icons";
import { LightRays } from "@/shared/components/ui/light-rays";
import { BackLink } from "@/shared/components/back-link";

const ORDER_OPTIONS = [
  {
    href: "/orders/new/csv",
    icon: <HugeiconsIcon icon={Csv01Icon} strokeWidth={2} />,
    title: "Import orders (CSV)",
    description:
      "Upload a CSV file to bulk-create orders and automatically calculate composite sales tax for each record.",
  },
  {
    href: "/orders/new/manual",
    icon: <HugeiconsIcon icon={PlusSignCircleIcon} strokeWidth={2} />,
    title: "Add order manually",
    description:
      "Create a single order by entering coordinates, timestamp, and subtotal — we'll compute tax breakdown instantly.",
  },
] as const;

export function NewOrderEntry() {
  return (
    <>
      <div className="m-5">
        <BackLink href="/orders">Back to Orders</BackLink>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 md:px-6 md:py-16">
        <LightRays
          count={4}
          color="oklch(0.5393 0.2713 286.7462 / 0.20)"
          blur={60}
          length="100vh"
        />
        <div className="mx-auto w-full max-w-3xl space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              How would you like to add orders?
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Choose a method below to get started.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:gap-6">
            {ORDER_OPTIONS.map((option) => (
              <Link
                key={option.href}
                href={option.href}
                className="group ring-foreground/10 bg-card text-card-foreground relative flex flex-col gap-6 rounded-xl p-6 ring-1 transition-all duration-200 hover:ring-primary/40 hover:bg-accent/40 md:p-8"
              >
                <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-lg transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground md:size-14">
                  <div className="flex size-6 items-center justify-center md:size-7">
                    {option.icon}
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  <h3 className="text-base font-medium md:text-lg">{option.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {option.description}
                  </p>
                </div>

                <div className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 group-hover:text-primary">
                  <span>Get started</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
