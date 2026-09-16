import "server-only";

/**
 * Shared cache-tag contract for R1 catalog reads and Sprint 9's signed event
 * callback. These strings intentionally match docs/Event Contract exactly.
 */
export const catalogCacheTags = {
  product: (productId: string) => `product:${productId}`,
  variantPrice: (sku: string) => `variant-price:${sku}`,
  category: (slug: string) => `category:${slug}`,
} as const;
