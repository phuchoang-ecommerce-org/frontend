import { z } from "zod";

import { catalogCacheTags } from "./cache-tags";

const EventEnvelopeSchema = z
  .object({
    eventId: z.string().uuid(),
    eventType: z.string().min(1),
    eventVersion: z.number().int().positive(),
    occurredAt: z.string().datetime(),
    aggregateType: z.string().min(1),
    aggregateId: z.string().uuid(),
    correlationId: z.string().uuid(),
    payload: z.unknown(),
  })
  .passthrough();

const ProductPayloadSchema = z
  .object({
    productId: z.string().uuid(),
    variantSkus: z.array(z.string().trim().min(1)),
  })
  .passthrough();

const ProductPublishedPayloadSchema = ProductPayloadSchema.extend({
  affectedCategorySlugs: z.array(z.string().trim().min(1)).min(1),
});

const CategoryChangedPayloadSchema = z
  .object({
    affectedCategorySlugs: z.array(z.string().trim().min(1)).min(1),
  })
  .passthrough();

export type CatalogRevalidationResult =
  | { kind: "known"; tags: string[] }
  | {
      kind: "unknown";
      eventId: string;
      eventType: string;
      correlationId: string;
    }
  | { kind: "invalid" };

function uniqueTags(tags: string[]): string[] {
  return [...new Set(tags)];
}

/**
 * Translate a verified catalog event to the cache tags it owns. Unknown event
 * types are intentionally harmless so an additive producer deployment cannot
 * turn revalidation into a 500.
 */
export function resolveCatalogRevalidation(
  raw: unknown,
): CatalogRevalidationResult {
  const envelope = EventEnvelopeSchema.safeParse(raw);
  if (!envelope.success) return { kind: "invalid" };

  const base = {
    eventId: envelope.data.eventId,
    eventType: envelope.data.eventType,
    correlationId: envelope.data.correlationId,
  };

  switch (envelope.data.eventType) {
    case "ProductPriceChanged":
    case "ProductDiscontinued": {
      const payload = ProductPayloadSchema.safeParse(envelope.data.payload);
      if (!payload.success) return { kind: "invalid" };
      return {
        kind: "known",
        tags: uniqueTags([
          catalogCacheTags.product(payload.data.productId),
          ...payload.data.variantSkus.map(catalogCacheTags.variantPrice),
        ]),
      };
    }
    case "ProductPublished": {
      const payload = ProductPublishedPayloadSchema.safeParse(
        envelope.data.payload,
      );
      if (!payload.success) return { kind: "invalid" };
      return {
        kind: "known",
        tags: uniqueTags([
          catalogCacheTags.product(payload.data.productId),
          ...payload.data.variantSkus.map(catalogCacheTags.variantPrice),
          ...payload.data.affectedCategorySlugs.map(catalogCacheTags.category),
        ]),
      };
    }
    case "CategoryChanged": {
      const payload = CategoryChangedPayloadSchema.safeParse(
        envelope.data.payload,
      );
      if (!payload.success) return { kind: "invalid" };
      return {
        kind: "known",
        tags: uniqueTags(
          payload.data.affectedCategorySlugs.map(catalogCacheTags.category),
        ),
      };
    }
    default:
      return { kind: "unknown", ...base };
  }
}
