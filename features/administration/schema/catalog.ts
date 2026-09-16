import { z } from "zod";

const MoneySchema = z
  .object({
    amount: z.string().regex(/^-?[0-9]{1,15}(\.[0-9]{1,4})?$/),
    currency: z.string().regex(/^[A-Z]{3}$/),
  })
  .strict();

export const AdminCategoryRefSchema = z
  .object({ id: z.string().uuid(), name: z.string(), slug: z.string() })
  .strict();

export const AdminCategorySchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    depth: z.number().int().min(0),
    parentId: z.string().uuid().optional(),
    sortOrder: z.number().int().optional(),
    imageUrl: z.string().url().optional(),
    featured: z.boolean().optional(),
    ancestors: z.array(AdminCategoryRefSchema).optional(),
  })
  .strict();

export type AdminCategory = z.infer<typeof AdminCategorySchema>;
export type AdminCategoryNode = AdminCategory & {
  children?: AdminCategoryNode[] | undefined;
};

export const AdminCategoryTreeSchema: z.ZodType<AdminCategoryNode[]> = z.array(
  AdminCategorySchema.extend({
    children: z.lazy(() => AdminCategoryTreeSchema).optional(),
  }),
);

export const AdminProductSummarySchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    publicationStatus: z.string(),
    brand: z.string().optional(),
    inStock: z.boolean().optional(),
  })
  .strict();

export const AdminProductPageSchema = z
  .object({
    items: z.array(AdminProductSummarySchema),
    page: z
      .object({
        size: z.number().int().min(1).max(100),
        next: z.string().optional(),
      })
      .strict(),
  })
  .strict();

export const AdminVariantSchema = z
  .object({
    id: z.string().uuid(),
    sku: z.string(),
    name: z.string().optional(),
    listPrice: MoneySchema,
    active: z.boolean(),
  })
  .strict();

export const AdminProductImageSchema = z
  .object({
    id: z.string().uuid(),
    url: z.string().url(),
    altText: z.string().optional(),
    sortOrder: z.number().int().optional(),
  })
  .strict();

export const AdminProductSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    brand: z.string().optional(),
    publicationStatus: z.string(),
    categories: z.array(AdminCategoryRefSchema),
    attributes: z.record(z.string(), z.unknown()).optional(),
    images: z.array(AdminProductImageSchema),
    variants: z.array(AdminVariantSchema),
  })
  .strict();

export type AdminProduct = z.infer<typeof AdminProductSchema>;
export type AdminProductSummary = z.infer<typeof AdminProductSummarySchema>;
export type AdminVariant = z.infer<typeof AdminVariantSchema>;
export type AdminProductImage = z.infer<typeof AdminProductImageSchema>;

const OptionalText = z.string().trim().optional();

export const ProductWriteSchema = z
  .object({
    name: z.string().trim().min(1),
    description: OptionalText,
    brand: OptionalText,
    categoryId: z.string().uuid().optional(),
    attributes: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const CategoryWriteSchema = z
  .object({
    name: z.string().trim().min(1),
    parentId: z.string().uuid().optional(),
    imageUrl: z.string().url().optional(),
    sortOrder: z.number().int().optional(),
    featured: z.boolean().optional(),
  })
  .strict();

export const VariantWriteSchema = z
  .object({
    sku: z.string().trim().min(1),
    name: OptionalText,
    listPrice: MoneySchema,
    active: z.boolean().optional(),
  })
  .strict();

export const ImageWriteSchema = z
  .object({
    url: z.string().url(),
    altText: OptionalText,
    sortOrder: z.number().int().optional(),
  })
  .strict();

export const PublicationChangeSchema = z
  .object({ publicationStatus: z.string().trim().min(1), reason: OptionalText })
  .strict();

export const PriceChangeSchema = z
  .object({ listPrice: MoneySchema, reason: z.string().trim().min(1) })
  .strict();

export const BulkResultSchema = z
  .object({
    results: z.array(
      z
        .object({
          productId: z.string().uuid(),
          applied: z.boolean(),
          code: z.string().optional(),
          detail: z.string().optional(),
        })
        .strict(),
    ),
  })
  .strict();

export type BulkResult = z.infer<typeof BulkResultSchema>;
