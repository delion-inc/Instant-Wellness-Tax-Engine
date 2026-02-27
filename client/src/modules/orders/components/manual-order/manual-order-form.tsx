"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { DateTimePicker } from "@/shared/components/ui/date-time-picker";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { CreateOrderFormValues } from "../../types/order.schemas";

interface ManualOrderFormProps {
  form: UseFormReturn<CreateOrderFormValues>;
  onSubmit: (data: CreateOrderFormValues) => void;
  isPending: boolean;
}

export function ManualOrderForm({ form, onSubmit, isPending }: ManualOrderFormProps) {
  const handleSubmit = form.handleSubmit(onSubmit);

  const handleFillSample = () => {
    form.reset({
      latitude: 40.7128,
      longitude: -74.006,
      date: new Date(),
      subtotal: "49.99",
    });
  };

  return (
    <Card className="flex h-full flex-col bg-card">
      <CardHeader>
        <CardTitle>Order details</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <form id="manual-order-form" onSubmit={handleSubmit}>
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <Controller
                name="latitude"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="manual-order-latitude">Latitude</FieldLabel>
                    <Input
                      {...field}
                      id="manual-order-latitude"
                      type="number"
                      step="any"
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g. 40.7128"
                      autoComplete="off"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? "" : e.target.value)}
                    />
                    <FieldDescription>-90 to 90</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="longitude"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="manual-order-longitude">Longitude</FieldLabel>
                    <Input
                      {...field}
                      id="manual-order-longitude"
                      type="number"
                      step="any"
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g. -74.0060"
                      autoComplete="off"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? "" : e.target.value)}
                    />
                    <FieldDescription>-180 to 180</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="date"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="manual-order-date">Date & time</FieldLabel>
                  <DateTimePicker
                    id="manual-order-date"
                    value={field.value}
                    onChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="subtotal"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="manual-order-subtotal">Subtotal</FieldLabel>
                  <Input
                    {...field}
                    id="manual-order-subtotal"
                    type="text"
                    inputMode="decimal"
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g. 49.99"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Positive amount. We&apos;ll calculate tax and total.
                  </FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2 sm:flex-row">
        <Button
          type="submit"
          form="manual-order-form"
          disabled={isPending}
          size="lg"
          className="w-full sm:max-w-[150px]"
        >
          {isPending ? "Calculating..." : "Calculate & save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full sm:max-w-[100px]"
          onClick={() =>
            form.reset({
              latitude: "" as unknown as number,
              longitude: "" as unknown as number,
              date: undefined,
              subtotal: "",
            })
          }
        >
          Reset
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="w-full sm:w-auto"
          onClick={handleFillSample}
        >
          Fill with sample data
        </Button>
      </CardFooter>
    </Card>
  );
}
