import "server-only";

import { z } from "zod";

import { MoneySchema } from "./money";

/** Integration Contract §4.3 — one failing field in a validation failure. */
export const FieldErrorSchema = z
  .object({
    field: z.string(),
    code: z.string().regex(/^ECP-[A-Z]{3}-[0-9]{4}$/),
    detail: z.string().optional(),
  })
  .strict();

/**
 * RFC 9457 `application/problem+json` — one shape for every error this API
 * returns (Integration Contract §4.1, common.yaml#Problem). `correlationId`
 * is genuinely optional — it is absent from the schema's `required` list.
 */
export const ProblemSchema = z
  .object({
    type: z.string(),
    title: z.string(),
    status: z.number().int().min(400).max(599),
    code: z.string().regex(/^ECP-[A-Z]{3}-[0-9]{4}$/),
    detail: z.string().optional(),
    instance: z.string(),
    correlationId: z.string().uuid().optional(),
    errors: z.array(FieldErrorSchema),
  })
  .strict();

export type Problem = z.infer<typeof ProblemSchema>;
export type FieldError = z.infer<typeof FieldErrorSchema>;

/** Integration Contract §3.1 — pagination metadata. Cursor only, never offset. */
export const PageSchema = z
  .object({
    size: z.number().int().min(1).max(100),
    next: z.string().optional(),
    total: z.number().int().min(0).optional(),
  })
  .strict();

/** The envelope every collection endpoint returns (common.yaml#PageEnvelope). */
export function pageEnvelopeSchema<TItem extends z.ZodTypeAny>(item: TItem) {
  return z.object({
    items: z.array(item),
    page: PageSchema,
  });
}

export { MoneySchema };
