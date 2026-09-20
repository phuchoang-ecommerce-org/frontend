import "server-only";

import { apiQuery, type ProductId } from "@/lib/api";

import {
  RatingSummarySchema,
  ReviewPageSchema,
  type RatingSummary,
  type Review,
} from "../schema/review";

const PRODUCT_DETAIL_REVALIDATE_SECONDS = 3600;

function productDetailCache(productId: ProductId) {
  return {
    revalidate: PRODUCT_DETAIL_REVALIDATE_SECONDS,
    tags: [`product:${productId}`],
  };
}

export async function getProductRatingSummary(
  productId: ProductId,
): Promise<RatingSummary> {
  return apiQuery(
    {
      path: "/products/{productId}/rating-summary",
      pathParams: { productId },
      cache: productDetailCache(productId),
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
      cache: productDetailCache(productId),
    },
    ReviewPageSchema,
  );
  return reviews.items;
}
