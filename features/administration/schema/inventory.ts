import { z } from "zod";

export const InventoryAdjustmentInputSchema = z
  .object({
    sku: z.string().trim().min(1),
    delta: z.coerce
      .number()
      .int()
      .refine((value) => value !== 0, {
        message: "Enter a non-zero quantity change.",
      }),
    reason: z.string().trim().min(1, "A reason is required."),
  })
  .strict();

export type InventoryAdjustmentInput = z.infer<
  typeof InventoryAdjustmentInputSchema
>;
