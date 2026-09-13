import "server-only";

import { z } from "zod";

import { MoneySchema, ProductIdSchema, pageEnvelopeSchema } from "@/lib/api";

const CategoryRefSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

export const CategorySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    depth: z.number().int().min(0),
    parentId: z.string().optional(),
    sortOrder: z.number().int().optional(),
    imageUrl: z.string().url().optional(),
    featured: z.boolean().optional(),
    ancestors: z.array(CategoryRefSchema).optional(),
  })
  .strict();

export type Category = z.infer<typeof CategorySchema>;

export type CategoryNode = Category & { children?: CategoryNode[] | undefined };

export const CategoryTreeSchema: z.ZodType<CategoryNode[]> = z.array(
  CategorySchema.extend({
    children: z.lazy(() => CategoryTreeSchema).optional(),
  }),
);

export const ProductSummarySchema = z
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

export type ProductSummary = z.infer<typeof ProductSummarySchema>;

export const ProductSummaryPageSchema =
  pageEnvelopeSchema(ProductSummarySchema);
