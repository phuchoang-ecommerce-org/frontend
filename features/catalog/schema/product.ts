import "server-only";

import { z } from "zod";

import { MoneySchema, ProductIdSchema } from "@/lib/api";

/**
 * Mirrors the catalog, review, and recommendation read contracts used by the
 * R1 product route. Each boundary has a narrow parser so a malformed optional
 * response cannot take the primary product read down with it.
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

export const RatingSummarySchema = z
  .object({
    averageRating: z.number().min(1).max(5).nullable().optional(),
    reviewCount: z.number().int().min(0),
    distribution: z.record(z.string(), z.number().int().min(0)),
  })
  .strict();

export const ReviewSchema = z
  .object({
    id: z.string(),
    productId: ProductIdSchema,
    rating: z.number().int().min(1).max(5),
    moderationStatus: z.string(),
    createdAt: z.string().datetime(),
    customerId: z.string().optional(),
    authorDisplayName: z.string().optional(),
    orderId: z.string().optional(),
    variantId: z.string().optional(),
    title: z.string().optional(),
    body: z.string().optional(),
    images: z
      .array(
        z
          .object({
            id: z.string(),
            url: z.string().url(),
            contentType: z.string().optional(),
            sizeBytes: z.number().int().min(1).optional(),
            sortOrder: z.number().int().optional(),
          })
          .strict(),
      )
      .optional(),
    verifiedBuyer: z.boolean().optional(),
    moderationReason: z.string().optional(),
    amended: z.boolean().optional(),
    amendedAt: z.string().datetime().optional(),
    editableUntil: z.string().datetime().optional(),
  })
  .strict();

export const ReviewPageSchema = z
  .object({
    items: z.array(ReviewSchema),
    page: z
      .object({
        size: z.number().int().min(1).max(100),
        next: z.string().optional(),
        total: z.number().int().min(0).optional(),
      })
      .strict(),
  })
  .strict();

export const RecommendationSchema = z
  .object({
    id: ProductIdSchema,
    name: z.string(),
    slug: z.string(),
    publicationStatus: z.string(),
    brand: z.string().optional(),
    primaryImageUrl: z.string().url().optional(),
    priceFrom: MoneySchema.optional(),
    priceTo: MoneySchema.optional(),
    averageRating: z.number().min(1).max(5).optional(),
    reviewCount: z.number().int().min(0).optional(),
    inStock: z.boolean().optional(),
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
export type RatingSummary = z.infer<typeof RatingSummarySchema>;
export type Review = z.infer<typeof ReviewSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
