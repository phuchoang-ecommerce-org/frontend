import "server-only";

import { z } from "zod";
import { backendRequest } from "./backend";
import type { components } from "./types";

export type CatalogProductWrite = components["schemas"]["ProductWrite"];
export type CatalogVariantWrite = components["schemas"]["VariantWrite"];
export type CatalogPublicationChange =
  components["schemas"]["PublicationChange"];
export type CatalogPriceChange = components["schemas"]["PriceChange"];

const moneySchema = z.object({
  amount: z.string().min(1),
  currency: z.string().regex(/^[A-Z]{3}$/),
});
const variantSchema = z.object({
  id: z.string().min(1),
  sku: z.string().min(1),
  name: z.string().nullish(),
  listPrice: moneySchema,
  promotionalPrice: moneySchema.nullish(),
  active: z.boolean(),
});
const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullish(),
  brand: z.string().nullish(),
  publicationStatus: z.string().min(1),
  variants: z.array(variantSchema),
});
const productSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  publicationStatus: z.string().min(1),
  priceFrom: moneySchema.nullish(),
  priceTo: moneySchema.nullish(),
});
const productPageSchema = z.object({
  items: z.array(productSummarySchema),
  page: z.object({
    size: z.number().int().nonnegative(),
    next: z.string().nullish(),
  }),
});

export type AdminCatalogProduct = z.infer<typeof productSchema>;
export type AdminCatalogProductSummary = z.infer<typeof productSummarySchema>;

function bearer(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

export async function listAdminProducts(
  accessToken: string,
): Promise<AdminCatalogProductSummary[]> {
  const response = await backendRequest("/products?size=50", {
    headers: bearer(accessToken),
    cache: "no-store",
  });
  if (!response.ok) throw response;
  return productPageSchema.parse(await response.json()).items;
}

export async function getAdminProduct(
  accessToken: string,
  productId: string,
): Promise<AdminCatalogProduct | null> {
  const response = await backendRequest(
    `/products/${encodeURIComponent(productId)}`,
    { headers: bearer(accessToken), cache: "no-store" },
  );
  if (response.status === 404) return null;
  if (!response.ok) throw response;
  return productSchema.parse(await response.json());
}

export function createAdminProduct(
  accessToken: string,
  product: CatalogProductWrite,
): Promise<Response> {
  return backendRequest("/products", {
    method: "POST",
    headers: bearer(accessToken),
    body: JSON.stringify(product),
    cache: "no-store",
  });
}

export function addAdminVariant(
  accessToken: string,
  productId: string,
  variant: CatalogVariantWrite,
): Promise<Response> {
  return backendRequest(`/products/${encodeURIComponent(productId)}/variants`, {
    method: "POST",
    headers: bearer(accessToken),
    body: JSON.stringify(variant),
    cache: "no-store",
  });
}

export function publishAdminProduct(
  accessToken: string,
  productId: string,
  publication: CatalogPublicationChange,
): Promise<Response> {
  return backendRequest(
    `/products/${encodeURIComponent(productId)}/publication`,
    {
      method: "PUT",
      headers: bearer(accessToken),
      body: JSON.stringify(publication),
      cache: "no-store",
    },
  );
}

export function changeAdminVariantPrice(
  accessToken: string,
  productId: string,
  variantId: string,
  change: CatalogPriceChange,
): Promise<Response> {
  return backendRequest(
    `/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}/price`,
    {
      method: "PUT",
      headers: bearer(accessToken),
      body: JSON.stringify(change),
      cache: "no-store",
    },
  );
}
