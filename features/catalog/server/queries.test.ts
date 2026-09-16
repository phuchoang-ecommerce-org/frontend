import { describe, expect, it, vi } from "vitest";

const apiQuery = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  apiQuery,
}));

import { getProduct, getProductVariant } from "./queries";

describe("product query cache policy", () => {
  it("uses the R1 ISR floor and a product tag", async () => {
    apiQuery.mockResolvedValue({});
    await getProduct("018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e12" as never);
    expect(apiQuery.mock.calls[0]?.[0]).toMatchObject({
      cache: {
        revalidate: 3600,
        tags: ["product:018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e12"],
      },
    });
  });

  it("uses its enclosing product tag for a variant read", async () => {
    apiQuery.mockResolvedValue({});
    await getProductVariant("product" as never, "variant");
    expect(apiQuery.mock.calls.at(-1)?.[0]).toMatchObject({
      cache: { revalidate: 3600, tags: ["product:product"] },
    });
  });
});
