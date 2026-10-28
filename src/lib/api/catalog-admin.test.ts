import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const backendRequest = vi.hoisted(() => vi.fn());
vi.mock("./backend", () => ({ backendRequest }));

import {
  addAdminVariant,
  createAdminProduct,
  getAdminProduct,
  listAdminProducts,
} from "./catalog-admin";

describe("catalog administration API client", () => {
  afterEach(() => vi.clearAllMocks());

  it("loads staff catalog records without a cache", async () => {
    backendRequest.mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              id: "product",
              name: "Draft product",
              publicationStatus: "DRAFT",
            },
          ],
          page: { size: 1, next: null },
        }),
      ),
    );

    await expect(listAdminProducts("access-token")).resolves.toEqual([
      expect.objectContaining({ id: "product", publicationStatus: "DRAFT" }),
    ]);
    expect(backendRequest).toHaveBeenCalledWith("/products?size=50", {
      headers: { Authorization: "Bearer access-token" },
      cache: "no-store",
    });
  });

  it("parses an operator product response with its variants", async () => {
    backendRequest.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "product",
          name: "Draft product",
          publicationStatus: "DRAFT",
          variants: [
            {
              id: "variant",
              sku: "SKU-1",
              listPrice: { amount: "10.00", currency: "USD" },
              active: true,
            },
          ],
        }),
      ),
    );

    await expect(getAdminProduct("access-token", "product")).resolves.toMatchObject({
      id: "product",
      variants: [expect.objectContaining({ sku: "SKU-1" })],
    });
  });

  it("uses separate create-product and add-variant writes", async () => {
    backendRequest.mockResolvedValue(new Response(null, { status: 201 }));

    await createAdminProduct("access-token", { name: "Draft" });
    await addAdminVariant("access-token", "product", {
      sku: "SKU-1",
      listPrice: { amount: "10.00", currency: "USD" },
      active: true,
    });

    expect(backendRequest).toHaveBeenNthCalledWith(
      1,
      "/products",
      expect.objectContaining({ method: "POST", cache: "no-store" }),
    );
    expect(backendRequest).toHaveBeenNthCalledWith(
      2,
      "/products/product/variants",
      expect.objectContaining({ method: "POST", cache: "no-store" }),
    );
  });
});
