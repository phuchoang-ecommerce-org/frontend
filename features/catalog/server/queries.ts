import "server-only";

import { z } from "zod";

import {
  apiQuery,
  asProductId,
  cursorQuery,
  toPage,
  type Page,
  type ProductId,
} from "@/lib/api";

import {
  CategorySchema,
  CategoryTreeSchema,
  ProductSummaryPageSchema,
  type Category,
  type CategoryNode,
  type ProductSummary,
} from "../schema/category";
import {
  ProductSchema,
  RatingSummarySchema,
  RecommendationSchema,
  ReviewPageSchema,
  VariantSchema,
  type Product,
  type RatingSummary,
  type Recommendation,
  type Review,
  type Variant,
} from "../schema/product";
import { catalogCacheTags } from "./cache-tags";

export type CatalogSort = "price" | "createdAt" | "popularity";

const CATALOG_REVALIDATE_SECONDS = 3600;

function catalogCache(tags: string[]) {
  return { revalidate: CATALOG_REVALIDATE_SECONDS, tags };
}

export async function listCategories(): Promise<CategoryNode[]> {
  return apiQuery(
    { path: "/categories", cache: catalogCache([catalogCacheTags.tree]) },
    CategoryTreeSchema,
  );
}

export async function getCategory(categoryId: string): Promise<Category> {
  return apiQuery(
    {
      path: "/categories/{categoryId}",
      pathParams: { categoryId },
      cache: catalogCache([
        catalogCacheTags.tree,
        catalogCacheTags.listing(categoryId),
      ]),
    },
    CategorySchema,
  );
}

export async function listCategoryProducts(
  categoryId: string,
  options: { cursor?: string; sort?: CatalogSort } = {},
): Promise<Page<ProductSummary>> {
  const envelope = await apiQuery(
    {
      path: "/categories/{categoryId}/products",
      pathParams: { categoryId },
      query: {
        ...cursorQuery(options.cursor),
        ...(options.sort ? { sort: options.sort } : {}),
      },
      cache: catalogCache([catalogCacheTags.listing(categoryId)]),
    },
    ProductSummaryPageSchema,
  );
  return toPage(envelope);
}

/**
 * R1 catalog detail is cacheable for one hour. Product and per-variant tags
 * are intentionally distinct so the Sprint 9 event handler can invalidate a
 * precise read without flushing the category tree.
 */
export async function getProduct(productId: ProductId): Promise<Product> {
  return apiQuery(
    {
      path: "/products/{productId}",
      pathParams: { productId },
      cache: catalogCache([catalogCacheTags.product(productId)]),
    },
    ProductSchema,
  );
}

export async function listProductVariants(
  productId: ProductId,
): Promise<Variant[]> {
  return apiQuery(
    {
      path: "/products/{productId}/variants",
      pathParams: { productId },
      cache: catalogCache([catalogCacheTags.product(productId)]),
    },
    z.array(VariantSchema),
  );
}

export async function getProductVariant(
  productId: ProductId,
  variantId: string,
): Promise<Variant> {
  return apiQuery(
    {
      path: "/products/{productId}/variants/{variantId}",
      pathParams: { productId, variantId },
      cache: catalogCache([
        catalogCacheTags.product(productId),
        catalogCacheTags.variant(variantId),
      ]),
    },
    VariantSchema,
  );
}

export async function getProductRatingSummary(
  productId: ProductId,
): Promise<RatingSummary> {
  return apiQuery(
    {
      path: "/products/{productId}/rating-summary",
      pathParams: { productId },
      cache: catalogCache([catalogCacheTags.product(productId)]),
    },
    RatingSummarySchema,
  );
}

export async function listProductReviews(
  productId: ProductId,
): Promise<Review[]> {
  const reviews = await apiQuery(
    {
      path: "/products/{productId}/reviews",
      pathParams: { productId },
      query: { size: "3" },
      cache: catalogCache([catalogCacheTags.product(productId)]),
    },
    ReviewPageSchema,
  );
  return reviews.items;
}

export async function listRelatedProducts(
  productId: ProductId,
): Promise<Recommendation[]> {
  return apiQuery(
    {
      path: "/products/{productId}/related-products",
      pathParams: { productId },
      query: { size: "4" },
      cache: catalogCache([catalogCacheTags.product(productId)]),
    },
    z.array(RecommendationSchema),
  );
}

export function findCategoryBySlugPath(
  tree: CategoryNode[],
  slugPath: string[],
): CategoryNode | undefined {
  let nodes = tree;
  let current: CategoryNode | undefined;
  for (const slug of slugPath) {
    current = nodes.find((node) => node.slug === slug);
    if (!current) return undefined;
    nodes = current.children ?? [];
  }
  return current;
}

export function categorySlugPaths(
  tree: CategoryNode[],
  prefix: string[] = [],
): string[][] {
  return tree.flatMap((node) => {
    const path = [...prefix, node.slug];
    return [path, ...categorySlugPaths(node.children ?? [], path)];
  });
}

export { asProductId };
