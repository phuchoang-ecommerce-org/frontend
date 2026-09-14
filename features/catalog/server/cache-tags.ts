import "server-only";

/**
 * Shared with catalog's EN-WIRE-3 invalidation namespace. EN-FE-API-3 must
 * reuse these exact strings when its signed catalog-event handler arrives.
 */
export const catalogCacheTags = {
  tree: "category-tree",
  listing: (categoryId: string) => `category-listing:${categoryId}`,
  product: (productId: string) => `product:${productId}`,
  variant: (variantId: string) => `variant:${variantId}`,
} as const;
