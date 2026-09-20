import "server-only";

import { z } from "zod";

import { apiQuery, type ProductId } from "@/lib/api";

import {
  RecommendationSchema,
  type Recommendation,
} from "../schema/recommendation";

const PRODUCT_DETAIL_REVALIDATE_SECONDS = 3600;

function productDetailCache(productId: ProductId) {
  return {
    revalidate: PRODUCT_DETAIL_REVALIDATE_SECONDS,
    tags: [`product:${productId}`],
  };
}

export async function listRelatedProducts(
  productId: ProductId,
): Promise<Recommendation[]> {
  return apiQuery(
    {
      path: "/products/{productId}/related-products",
      pathParams: { productId },
      query: { size: "4" },
      cache: productDetailCache(productId),
    },
    z.array(RecommendationSchema),
  );
}
