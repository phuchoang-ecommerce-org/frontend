import "server-only";

import { z } from "zod";

import { MoneySchema, ProductIdSchema } from "@/lib/api";

/**
 * Mirrors components/schemas/catalog.yaml#Product. `reviews` and
 * `relatedProducts` are independently omittable by contract
 * (NFR-AVAIL-02) — modeled loosely here since this sprint only needs the
 * walking-skeleton fields, not the full review/recommendation shape.
 */
const CategoryRefSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

const VariantSchema = z
  .object({
    id: z.string(),
    sku: z.string(),
    name: z.string().optional(),
    listPrice: MoneySchema,
    promotionalPrice: MoneySchema.optional(),
    options: z.record(z.string(), z.string()).optional(),
    weightGrams: z.number().int().min(0).optional(),
    active: z.boolean(),
    availability: z.unknown().optional(),
  })
  .passthrough();

const ProductImageSchema = z.object({
  id: z.string(),
  url: z.string(),
  altText: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export const ProductSchema = z
  .object({
    id: ProductIdSchema,
    name: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    brand: z.string().optional(),
    publicationStatus: z.string(),
    publishedAt: z.string().optional(),
    categories: z.array(CategoryRefSchema),
    attributes: z.record(z.string(), z.unknown()).optional(),
    images: z.array(ProductImageSchema),
    variants: z.array(VariantSchema),
    averageRating: z.number().min(1).max(5).optional(),
    reviewCount: z.number().int().min(0).optional(),
    reviews: z.unknown().optional(),
    relatedProducts: z.array(z.unknown()).optional(),
  })
  .passthrough();

export type Product = z.infer<typeof ProductSchema>;
