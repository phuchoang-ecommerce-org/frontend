import { describe, expect, it } from "vitest";

import {
  ProductSchema,
  PromotionMetadataSchema,
} from "./product";

const product = {
  id: "018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e12",
  name: "Trail Runner Jacket",
  slug: "trail-runner-jacket",
  publicationStatus: "PUBLISHED",
  categories: [{ id: "outerwear", name: "Outerwear", slug: "outerwear" }],
  images: [],
  variants: [
    {
      id: "black-m",
      sku: "TRJ-BLK-M",
      listPrice: { amount: "120.00", currency: "USD" },
      promotionalPrice: { amount: "99.00", currency: "USD" },
      activePromotion: {
        validFrom: "2026-09-01T00:00:00.000Z",
        validUntil: "2026-09-30T23:59:59.000Z",
      },
      active: true,
      availability: { inStock: true },
    },
  ],
};

describe("product detail schemas", () => {
  it("parses a product with active-promotion metadata", () => {
    expect(
      ProductSchema.parse(product).variants[0]?.activePromotion?.validUntil,
    ).toBe("2026-09-30T23:59:59.000Z");
  });

  it("rejects malformed promotion metadata", () => {
    expect(() =>
      PromotionMetadataSchema.parse({ validFrom: "not-a-date" }),
    ).toThrow();
  });

});
