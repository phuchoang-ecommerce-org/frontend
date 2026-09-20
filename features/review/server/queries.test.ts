import { describe, expect, it, vi } from "vitest";

const apiQuery = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  apiQuery,
}));

import { getProductRatingSummary, listProductReviews } from "./queries";

const productId = "018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e12";

describe("product review query cache policy", () => {
  it("preserves the R1 product tag and review page size", async () => {
    apiQuery.mockResolvedValue({ items: [] });

    await getProductRatingSummary(productId as never);
    await listProductReviews(productId as never);

    expect(apiQuery.mock.calls[0]?.[0]).toMatchObject({
      path: "/products/{productId}/rating-summary",
      cache: { revalidate: 3600, tags: [`product:${productId}`] },
    });
    expect(apiQuery.mock.calls[1]?.[0]).toMatchObject({
      path: "/products/{productId}/reviews",
      query: { size: "3" },
      cache: { revalidate: 3600, tags: [`product:${productId}`] },
    });
  });
});
