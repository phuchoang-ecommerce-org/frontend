import { describe, expect, it, vi } from "vitest";

const apiQuery = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  apiQuery,
}));

import { listRelatedProducts } from "./queries";

const productId = "018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e12";

describe("product recommendation query cache policy", () => {
  it("preserves the R1 product tag and recommendation page size", async () => {
    apiQuery.mockResolvedValue([]);

    await listRelatedProducts(productId as never);

    expect(apiQuery.mock.calls[0]?.[0]).toMatchObject({
      path: "/products/{productId}/related-products",
      query: { size: "4" },
      cache: { revalidate: 3600, tags: [`product:${productId}`] },
    });
  });
});
