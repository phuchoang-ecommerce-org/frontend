import "server-only";

import { apiQuery, asProductId, type ProductId } from "@/lib/api";

import { ProductSchema, type Product } from "../schema/product";

/**
 * getProduct (paths/catalog.yaml#productById, security: []). Cache policy
 * is explicit `no-store` for now — the production `force-cache` + tags
 * policy (Data Fetching.md §2.3/§7) is deferred to the sprint that builds
 * real catalog revalidation.
 */
export async function getProduct(productId: ProductId): Promise<Product> {
  return apiQuery(
    {
      path: "/products/{productId}",
      pathParams: { productId },
      cache: "no-store",
    },
    ProductSchema,
  );
}

export { asProductId };
