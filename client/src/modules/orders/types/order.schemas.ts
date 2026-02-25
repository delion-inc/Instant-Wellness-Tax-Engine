import { z } from "zod";

const requiredNumber = (name: string, min: number, max: number) =>
  z
    .any()
    .refine(
      (val) => val !== "" && val !== undefined && val !== null,
      `${name} is required`,
    )
    .transform(Number)
    .refine((val) => !isNaN(val), "Must be a valid number")
    .refine(
      (val) => val >= min && val <= max,
      `Must be between ${min} and ${max}`,
    );

export const createOrderSchema = z.object({
  latitude: requiredNumber("Latitude", -90, 90),
  longitude: requiredNumber("Longitude", -180, 180),
  date: z.date().optional(),
  subtotal: z
    .string()
    .min(1, "Subtotal is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount (e.g. 49.99)")
    .refine((val) => parseFloat(val) > 0, "Must be a positive amount"),
});

export type CreateOrderFormValues = z.infer<typeof createOrderSchema>;
