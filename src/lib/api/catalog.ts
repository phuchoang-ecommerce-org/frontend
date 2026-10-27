import "server-only";

import { z } from "zod";
import { backendRequest } from "./backend";
import type { components } from "./types";

const CATALOG_REVALIDATE_SECONDS = 300;

const idSchema = z.string().min(1);
const moneySchema = z.object({
  amount: z.string().regex(/^-?[0-9]{1,15}(\.[0-9]{1,4})?$/),
  currency: z.string().regex(/^[A-Z]{3}$/),
});
const categoryRefSchema = z.object({
  id: idSchema,
  name: z.string(),
  slug: z.string(),
});
const categoryBaseSchema = z.object({
  id: idSchema,
  parentId: idSchema.nullish(),
  name: z.string(),
  slug: z.string(),
  depth: z.number().int().nonnegative(),
  sortOrder: z.number().int().nullish(),
  imageUrl: z.string().nullish(),
  featured: z.boolean().nullish(),
  ancestors: z.array(categoryRefSchema).nullish(),
});
type CategoryNodeInput = z.infer<typeof categoryBaseSchema> & {
  children?: CategoryNodeInput[] | null | undefined;
};
const categoryNodeSchema: z.ZodType<CategoryNodeInput> = categoryBaseSchema.extend({
  // Prism terminates the recursive sample with `null`; discard that sentinel.
  children: z
    .lazy(() => z.array(categoryNodeSchema.nullable()))
    .transform((children) => children.filter((child) => child !== null))
    .nullish(),
});
const productSummarySchema = z.object({
  id: idSchema,
  name: z.string(),
  slug: z.string(),
  brand: z.string().nullish(),
  publicationStatus: z.string(),
  primaryImageUrl: z.string().nullish(),
  priceFrom: moneySchema.nullish(),
  priceTo: moneySchema.nullish(),
  averageRating: z.number().nullish(),
  reviewCount: z.number().int().nonnegative().nullish(),
  inStock: z.boolean().nullish(),
});
const pageSchema = z.object({
  size: z.number().int().nonnegative(),
  next: z.string().nullish(),
  total: z.number().int().nonnegative().nullish(),
});
const productPageSchema = z.object({
  items: z.array(productSummarySchema),
  page: pageSchema,
});
const availabilitySchema = z.object({
  inStock: z.boolean(),
  lowStock: z.boolean().nullish(),
});
const variantSchema = z.object({
  id: idSchema,
  sku: z.string(),
  name: z.string().nullish(),
  listPrice: moneySchema,
  promotionalPrice: moneySchema.nullish(),
  options: z.record(z.string(), z.string()).nullish(),
  weightGrams: z.number().int().nonnegative().nullish(),
  active: z.boolean(),
  availability: availabilitySchema.nullish(),
});
const productSchema = z.object({
  id: idSchema,
  name: z.string(),
  slug: z.string(),
  description: z.string().nullish(),
  brand: z.string().nullish(),
  publicationStatus: z.string(),
  publishedAt: z.string().nullish(),
  categories: z.array(categoryRefSchema),
  attributes: z.record(z.string(), z.unknown()).nullish(),
  images: z.array(
    z.object({
      id: idSchema,
      url: z.string(),
      altText: z.string().nullish(),
      sortOrder: z.number().int().nullish(),
    }),
  ),
  variants: z.array(variantSchema),
  averageRating: z.number().nullish(),
  reviewCount: z.number().int().nonnegative().nullish(),
});

export type ApiMoney = z.infer<typeof moneySchema>;
export type ApiCategory = z.infer<typeof categoryNodeSchema>;
export type ApiCategoryDetail = z.infer<typeof categoryBaseSchema>;
export type ApiProductSummary = z.infer<typeof productSummarySchema>;
export type ApiProduct = z.infer<typeof productSchema>;
export type ApiProductPage = z.infer<typeof productPageSchema>;

type ContractCategory = components["schemas"]["CategoryNode"];
type ContractProduct = components["schemas"]["Product"];
type ContractProductPage = components["schemas"]["ProductSummaryPage"];
type CatalogContractCompatibility =
  ContractCategory extends ApiCategory
    ? ContractProduct extends ApiProduct
      ? ContractProductPage extends ApiProductPage
        ? true
        : never
      : never
    : never;
const catalogContractCompatibility: CatalogContractCompatibility = true;
void catalogContractCompatibility;

async function catalogJson<T>(
  path: string,
  schema: z.ZodType<T>,
  tags: string[],
): Promise<T | null> {
  const response = await backendRequest(path, {
    next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Catalog data could not be loaded");
  const parsed = schema.safeParse(await response.json());
  if (!parsed.success) throw new Error("Catalog returned an invalid response");
  return parsed.data;
}

export async function fetchCategories(): Promise<ApiCategory[]> {
  const result = await catalogJson("/categories", z.array(categoryNodeSchema), [
    "catalog",
    "categories",
  ]);
  return result ?? [];
}

export function fetchCategory(categoryId: string): Promise<ApiCategoryDetail | null> {
  return catalogJson(
    `/categories/${encodeURIComponent(categoryId)}`,
    categoryBaseSchema,
    ["catalog", `category:${categoryId}`],
  );
}

export async function fetchProducts(cursor?: string): Promise<ApiProductPage> {
  const params = new URLSearchParams({ size: "24" });
  if (cursor) params.set("cursor", cursor);
  const page = await catalogJson(`/products?${params}`, productPageSchema, [
    "catalog",
    "products",
  ]);
  if (!page) throw new Error("Products could not be loaded");
  return page;
}

export async function fetchCategoryProducts(
  categoryId: string,
  cursor?: string,
): Promise<ApiProductPage | null> {
  const params = new URLSearchParams({ size: "24" });
  if (cursor) params.set("cursor", cursor);
  return catalogJson(
    `/categories/${encodeURIComponent(categoryId)}/products?${params}`,
    productPageSchema,
    ["catalog", "products", `category:${categoryId}`],
  );
}

export function fetchProduct(productId: string): Promise<ApiProduct | null> {
  return catalogJson(
    `/products/${encodeURIComponent(productId)}`,
    productSchema,
    ["catalog", "products", `product:${productId}`],
  );
}
