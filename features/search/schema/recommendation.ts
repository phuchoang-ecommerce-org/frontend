import "server-only";

import { z } from "zod";

import { MoneySchema, ProductIdSchema } from "@/lib/api";

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

export type Recommendation = z.infer<typeof RecommendationSchema>;
