import "server-only";

import { z } from "zod";

import { AddressSchema, pageEnvelopeSchema } from "@/lib/api";

/**
 * Mirrors components/schemas/identity.yaml#CustomerAddress (`allOf` over the
 * shared-kernel `Address` plus `id`/default flags). Not `.strict()` — tolerant
 * of additive fields, like `AccountSchema`.
 */
export const CustomerAddressSchema = AddressSchema.extend({
  id: z.string(),
  isDefaultShipping: z.boolean().optional(),
  isDefaultBilling: z.boolean().optional(),
}).passthrough();

export type CustomerAddress = z.infer<typeof CustomerAddressSchema>;

/** Mirrors components/schemas/identity.yaml#CustomerAddressWrite. */
export const CustomerAddressWriteSchema = AddressSchema.extend({
  isDefaultShipping: z.boolean().optional(),
  isDefaultBilling: z.boolean().optional(),
}).strict();

export type CustomerAddressWrite = z.infer<typeof CustomerAddressWriteSchema>;

/** Mirrors components/schemas/identity.yaml#CustomerAddressPage. */
export const CustomerAddressPageSchema = pageEnvelopeSchema(CustomerAddressSchema);
