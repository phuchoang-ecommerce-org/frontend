import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const backendRequest = vi.hoisted(() => vi.fn());
vi.mock("./backend", () => ({ backendRequest }));

import { fetchProducts } from "./catalog";

describe("fetchProducts", () => {
  afterEach(() => vi.clearAllMocks());

  it("requests exactly one cursor page from the catalog list operation", async () => {
    backendRequest.mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [],
          page: { size: 24, next: "next-cursor" },
        }),
        { status: 200 },
      ),
    );

    const result = await fetchProducts("current-cursor");

    expect(backendRequest).toHaveBeenCalledOnce();
    expect(backendRequest).toHaveBeenCalledWith(
      "/products?size=24&cursor=current-cursor",
      {
        next: {
          revalidate: 300,
          tags: ["catalog", "products"],
        },
      },
    );
    expect(result.page.next).toBe("next-cursor");
  });
});
