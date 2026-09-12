import "server-only";

import { z } from "zod";

/**
 * The shared-kernel `Address` value object (Domain Model §5.3,
 * common.yaml#Address) — the same shape backs a customer's address-book entry
 * and the immutable snapshot frozen onto an order at placement (`BR-ORD-06`).
 * Lives in `lib/api`, not a feature, so `features/identity` and
 * `features/ordering` can both use it without a forbidden cross-feature import
 * (rule I-1).
 */
export const AddressSchema = z
  .object({
    label: z.string().optional(),
    recipientName: z.string(),
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    region: z.string().optional(),
    postalCode: z.string(),
    countryCode: z.string().regex(/^[A-Z]{2}$/),
    phone: z.string().optional(),
  })
  .strict();

export type Address = z.infer<typeof AddressSchema>;
