import { createHmac, timingSafeEqual } from "node:crypto";

import { revalidateTag } from "next/cache";
import { z } from "zod";

export const runtime = "nodejs";

const SIGNATURE_HEADER = "X-ECP-Signature";
const signatureSchema = z.string().regex(/^sha256=[0-9a-f]{64}$/);
const uuidSchema = z.string().uuid();
const tagPartSchema = z.string().min(1);

const envelopeSchema = z
  .object({
    eventId: uuidSchema,
    eventType: z.string().min(1),
    eventVersion: z.literal(1),
    occurredAt: z.string().datetime({ offset: true }),
    aggregateType: z.string().min(1),
    aggregateId: uuidSchema,
    correlationId: uuidSchema,
    actor: z
      .object({
        userId: uuidSchema.optional(),
        role: z.string().nullable().optional(),
      })
      .strict()
      .nullable()
      .optional(),
    payload: z.record(z.string(), z.unknown()),
  })
  .strict();

const productPayloadSchema = z
  .object({
    productId: uuidSchema,
    variantSkus: z.array(tagPartSchema).min(1),
  })
  .passthrough();
const discontinuedPayloadSchema = z
  .object({
    productId: uuidSchema,
    variantSkus: z.array(tagPartSchema),
  })
  .passthrough();
const publishedPayloadSchema = z
  .object({
    productId: uuidSchema,
    variantSkus: z.array(tagPartSchema),
    affectedCategorySlugs: z.array(tagPartSchema).min(1),
    affectedCategoryIds: z.array(uuidSchema).optional(),
  })
  .passthrough();
const runtimeProductPayloadSchema = z
  .object({
    productId: uuidSchema,
    variantSkus: z.array(tagPartSchema),
    affectedCategorySlugs: z.array(tagPartSchema),
    affectedCategoryIds: z.array(uuidSchema),
  })
  .passthrough();
const categoryPayloadSchema = z
  .object({
    id: uuidSchema,
    name: z.string().min(1),
    slug: tagPartSchema,
    path: z.string().regex(/^\/.+\/$/),
    depth: z.number().int().nonnegative(),
    sortOrder: z.number().int(),
    affectedCategorySlugs: z.array(tagPartSchema).min(1),
    affectedCategoryIds: z.array(uuidSchema).optional(),
  })
  .passthrough();
const categoryRemovedPayloadSchema = z
  .object({
    id: uuidSchema,
    affectedCategorySlugs: z.array(tagPartSchema).min(1),
    affectedCategoryIds: z.array(uuidSchema).min(1),
  })
  .passthrough();

type EventEnvelope = z.infer<typeof envelopeSchema>;

function signatureFor(rawBody: Uint8Array, secret: string): Buffer {
  return createHmac("sha256", secret).update(rawBody).digest();
}

function hasValidSignature(
  signature: string | null,
  rawBody: Uint8Array,
  secret: string | undefined,
): boolean {
  if (!secret || !signature) return false;
  const parsed = signatureSchema.safeParse(signature);
  if (!parsed.success) return false;

  const received = Buffer.from(parsed.data.slice("sha256=".length), "hex");
  const expected = signatureFor(rawBody, secret);
  return received.length === expected.length && timingSafeEqual(received, expected);
}

function safeTag(tag: string): string | null {
  return tag.length <= 256 ? tag : null;
}

function tagSet(...tags: string[]): string[] {
  return [...new Set(tags.map(safeTag).filter((tag): tag is string => tag !== null))];
}

function productTags(productId: string, variantSkus: string[]): string[] {
  // `catalog` and `products` cover the current frontend cache mapping. The
  // specific v1 tags are retained for the documented mapping and any future
  // fetches that adopt it.
  return tagSet(
    "catalog",
    "products",
    `product:${productId}`,
    ...variantSkus.map((sku) => `variant-price:${sku}`),
  );
}

function categoryTags(
  categorySlugs: string[],
  categoryIds: string[] = [],
): string[] {
  return tagSet(
    "catalog",
    "categories",
    ...categorySlugs.map((slug) => `category:${slug}`),
    ...categoryIds.map((id) => `category:${id}`),
  );
}

function productAndCategoryTags(
  productId: string,
  variantSkus: string[],
  categorySlugs: string[],
  categoryIds: string[],
): string[] {
  return tagSet(
    ...productTags(productId, variantSkus),
    ...categoryTags(categorySlugs, categoryIds),
  );
}

function tagsFor(event: EventEnvelope): string[] | null {
  switch (event.eventType) {
    case "ProductPriceChanged": {
      if (event.aggregateType !== "Product") return [];
      const payload = productPayloadSchema.safeParse(event.payload);
      return payload.success
        ? productTags(payload.data.productId, payload.data.variantSkus)
        : null;
    }
    case "ProductDiscontinued": {
      if (event.aggregateType !== "Product") return [];
      const payload = discontinuedPayloadSchema.safeParse(event.payload);
      return payload.success
        ? productTags(payload.data.productId, payload.data.variantSkus)
        : null;
    }
    case "ProductPublished": {
      if (event.aggregateType !== "Product") return [];
      const payload = publishedPayloadSchema.safeParse(event.payload);
      return payload.success
        ? productAndCategoryTags(
            payload.data.productId,
            payload.data.variantSkus,
            payload.data.affectedCategorySlugs,
            payload.data.affectedCategoryIds ?? [],
          )
        : null;
    }
    // The backend already emits these v1 payloads. They are accepted as a
    // compatibility extension until the proposed callback contract names them.
    case "ProductUpdated":
    case "VariantAdded": {
      if (event.aggregateType !== "Product") return [];
      const payload = runtimeProductPayloadSchema.safeParse(event.payload);
      return payload.success
        ? productAndCategoryTags(
            payload.data.productId,
            payload.data.variantSkus,
            payload.data.affectedCategorySlugs,
            payload.data.affectedCategoryIds,
          )
        : null;
    }
    case "CategoryChanged": {
      if (event.aggregateType !== "Category") return [];
      const payload = categoryPayloadSchema.safeParse(event.payload);
      if (payload.success) {
        return categoryTags(
          payload.data.affectedCategorySlugs,
          payload.data.affectedCategoryIds ?? [],
        );
      }
      const removedPayload = categoryRemovedPayloadSchema.safeParse(event.payload);
      return removedPayload.success
        ? categoryTags(
            removedPayload.data.affectedCategorySlugs,
            removedPayload.data.affectedCategoryIds,
          )
        : null;
    }
    default:
      return [];
  }
}

function logCallback(
  outcome: "accepted" | "unsupported" | "invalid-schema" | "invalid-signature",
  event?: Pick<EventEnvelope, "eventId" | "eventType" | "correlationId">,
): void {
  console.warn("catalog.revalidation_callback", {
    outcome,
    ...(event
      ? {
          eventId: event.eventId,
          eventType: event.eventType,
          correlationId: event.correlationId,
        }
      : {}),
  });
}

export async function POST(request: Request): Promise<Response> {
  const rawBody = new Uint8Array(await request.arrayBuffer());
  const signature = request.headers.get(SIGNATURE_HEADER);

  // Do not parse untrusted JSON until the raw bytes have been authenticated.
  if (!hasValidSignature(signature, rawBody, process.env.ECP_REVALIDATE_SECRET)) {
    logCallback("invalid-signature");
    return new Response(null, { status: 401 });
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(new TextDecoder().decode(rawBody));
  } catch {
    logCallback("invalid-schema");
    return new Response(null, { status: 400 });
  }

  const event = envelopeSchema.safeParse(parsedJson);
  if (!event.success) {
    logCallback("invalid-schema");
    return new Response(null, { status: 400 });
  }

  const tags = tagsFor(event.data);
  if (tags === null) {
    logCallback("invalid-schema", event.data);
    return new Response(null, { status: 400 });
  }
  if (tags.length === 0) {
    logCallback("unsupported", event.data);
    return new Response(null, { status: 204 });
  }

  for (const tag of tags) {
    // A callback is an external event, so the first subsequent read must fetch
    // fresh data rather than serve a stale-while-revalidate response.
    revalidateTag(tag, { expire: 0 });
  }
  logCallback("accepted", event.data);
  return new Response(null, { status: 204 });
}
