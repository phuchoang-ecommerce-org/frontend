import "server-only";

import { z } from "zod";

import { ProductIdSchema } from "@/lib/api";

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

export type RatingSummary = z.infer<typeof RatingSummarySchema>;
export type Review = z.infer<typeof ReviewSchema>;
