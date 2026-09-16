import "server-only";

import { apiQuery, toPage, type Page } from "@/lib/api";

import {
  AdminCategorySchema,
  AdminCategoryTreeSchema,
  AdminProductPageSchema,
  AdminProductSchema,
  AdminVariantSchema,
  type AdminCategory,
  type AdminCategoryNode,
  type AdminProduct,
  type AdminProductSummary,
  type AdminVariant,
} from "../schema/catalog";

/** All admin reads are R4: dynamic and never cached. */
export async function listAdminProducts(options: {
  cursor?: string;
  publicationStatus?: string;
  categoryId?: string;
}): Promise<Page<AdminProductSummary>> {
  return toPage(
    await apiQuery(
      {
        path: "/products",
        query: {
          cursor: options.cursor,
          publicationStatus: options.publicationStatus,
          categoryId: options.categoryId,
        },
        cache: "no-store",
      },
      AdminProductPageSchema,
    ),
  );
}

export function getAdminProduct(productId: string): Promise<AdminProduct> {
  return apiQuery(
    {
      path: "/products/{productId}",
      pathParams: { productId },
      cache: "no-store",
    },
    AdminProductSchema,
  );
}

export function listAdminProductVariants(
  productId: string,
): Promise<AdminVariant[]> {
  return apiQuery(
    {
      path: "/products/{productId}/variants",
      pathParams: { productId },
      cache: "no-store",
    },
    AdminVariantSchema.array(),
  );
}

export function listAdminCategories(): Promise<AdminCategoryNode[]> {
  return apiQuery(
    { path: "/categories", cache: "no-store" },
    AdminCategoryTreeSchema,
  );
}

export function getAdminCategory(categoryId: string): Promise<AdminCategory> {
  return apiQuery(
    {
      path: "/categories/{categoryId}",
      pathParams: { categoryId },
      cache: "no-store",
    },
    AdminCategorySchema,
  );
}

export async function listAdminCategoryProducts(
  categoryId: string,
): Promise<Page<AdminProductSummary>> {
  return toPage(
    await apiQuery(
      {
        path: "/categories/{categoryId}/products",
        pathParams: { categoryId },
        cache: "no-store",
      },
      AdminProductPageSchema,
    ),
  );
}
