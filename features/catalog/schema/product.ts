import "server-only";

import { z } from "zod";

import { MoneySchema, ProductIdSchema } from "@/lib/api";

/**
 * Mirrors the catalog read contracts used by the R1 product route. Optional
 * review and recommendation responses are parsed by their owning features.
 */
export const CategoryRefSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
  })
  .strict();

export const PromotionMetadataSchema = z
  .object({
    validFrom: z.string().datetime(),
    validUntil: z.string().datetime(),
  })
  .strict();

export const VariantSchema = z
  .object({
    id: z.string(),
    sku: z.string(),
    name: z.string().optional(),
    listPrice: MoneySchema,
    promotionalPrice: MoneySchema.optional(),
    activePromotion: PromotionMetadataSchema.optional(),
    options: z.record(z.string(), z.string()).optional(),
    weightGrams: z.number().int().min(0).optional(),
    active: z.boolean(),
    availability: z
      .object({
        inStock: z.boolean(),
        lowStock: z.boolean().optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const ProductImageSchema = z
  .object({
    id: z.string(),
    url: z.string(),
    altText: z.string().optional(),
    sortOrder: z.number().int().optional(),
  })
  .strict();

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
  .strict();

export type Product = z.infer<typeof ProductSchema>;
export type CategoryRef = z.infer<typeof CategoryRefSchema>;
export type Variant = z.infer<typeof VariantSchema>;
