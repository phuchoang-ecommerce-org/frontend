import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const catalogMocks = vi.hoisted(() => ({
  fetchProducts: vi.fn(),
  fetchCategoryProducts: vi.fn(),
  fetchProduct: vi.fn(),
  fetchCategories: vi.fn(),
  fetchCategory: vi.fn(),
}));

vi.mock("@/lib/api/catalog", () => catalogMocks);

import { getCategoryProducts, getProduct, getProducts } from "./queries";

const publishedSummary = {
  id: "published-product",
  name: "Published product",
  slug: "published-product",
  publicationStatus: "PUBLISHED",
  priceFrom: { amount: "10.00", currency: "USD" },
  priceTo: { amount: "12.00", currency: "USD" },
  inStock: true,
};

const draftSummary = {
  ...publishedSummary,
  id: "draft-product",
  name: "Draft product",
  publicationStatus: "DRAFT",
};

const unknownAvailabilitySummary = {
  ...publishedSummary,
  id: "unknown-availability-product",
  name: "Availability pending product",
  inStock: undefined,
};

describe("catalog browse queries", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fails closed for unpublished records in a global browse response", async () => {
    catalogMocks.fetchProducts.mockResolvedValue({
      items: [publishedSummary, draftSummary],
      page: { size: 24, next: "next-page" },
    });

    await expect(getProducts()).resolves.toEqual({
      products: [
        expect.objectContaining({
          id: "published-product",
          price: "$10.00 – $12.00",
          availability: "available",
        }),
      ],
      nextCursor: "next-page",
    });
  });

  it("keeps the publication boundary and preserves unknown category availability", async () => {
    catalogMocks.fetchCategoryProducts.mockResolvedValue({
      items: [unknownAvailabilitySummary, draftSummary],
      page: { size: 24, next: null },
    });

    await expect(getCategoryProducts("category-id")).resolves.toEqual({
      products: [
        expect.objectContaining({
          id: "unknown-availability-product",
          availability: "unknown",
        }),
      ],
    });
  });

  it("does not expose an unpublished detail response and omits inactive variants", async () => {
    catalogMocks.fetchProduct.mockResolvedValue({
      ...publishedSummary,
      description: null,
      brand: null,
      publishedAt: null,
      categories: [],
      attributes: null,
      images: [],
      variants: [
        {
          id: "active-variant",
          sku: "ACTIVE-SKU",
          name: null,
          listPrice: { amount: "10.00", currency: "USD" },
          promotionalPrice: null,
          options: null,
          weightGrams: null,
          active: true,
          availability: { inStock: false, lowStock: null },
        },
        {
          id: "inactive-variant",
          sku: "INACTIVE-SKU",
          name: null,
          listPrice: { amount: "10.00", currency: "USD" },
          promotionalPrice: null,
          options: null,
          weightGrams: null,
          active: false,
          availability: { inStock: true, lowStock: null },
        },
      ],
      averageRating: null,
      reviewCount: null,
    });

    await expect(getProduct("published-product")).resolves.toMatchObject({
      id: "published-product",
      variants: [
        expect.objectContaining({
          id: "active-variant",
          availability: "unavailable",
          available: false,
        }),
      ],
    });

    catalogMocks.fetchProduct.mockResolvedValue({
      ...draftSummary,
      categories: [],
      attributes: null,
      images: [],
      variants: [],
      averageRating: null,
      reviewCount: null,
    });

    await expect(getProduct("draft-product")).resolves.toBeNull();
  });
});
