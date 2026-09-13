import "server-only";

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
import { ProductSchema, type Product } from "../schema/product";
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
