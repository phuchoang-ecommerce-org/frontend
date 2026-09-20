import { describe, expect, it } from "vitest";

import { productVariantHref, selectedVariantId } from "./variant";

describe("catalog variant URL contract", () => {
  it("reads the selected variant from the URL", () => {
    expect(selectedVariantId(new URLSearchParams("variant=sku%2Fblue"))).toBe(
      "sku/blue",
    );
  });

  it("preserves the existing replacement URL behavior", () => {
    expect(productVariantHref("/p/product-1", "sku/blue")).toBe(
      "/p/product-1?variant=sku%2Fblue",
    );
    expect(productVariantHref("/p/product-1", undefined)).toBe("/p/product-1");
  });
});
