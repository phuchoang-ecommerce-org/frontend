import { describe, expect, it } from "vitest";

import type { Variant } from "../schema/product";
import {
  matchingPriceRange,
  selectedOptionsForVariant,
  selectedVariant,
  variantChoices,
} from "./variant-selection";

const variants = [
  {
    id: "black-s",
    sku: "JKT-BLK-S",
    listPrice: { amount: "90.00", currency: "USD" },
    active: true,
    options: { color: "Black", size: "S" },
    availability: { inStock: true },
  },
  {
    id: "black-m",
    sku: "JKT-BLK-M",
    listPrice: { amount: "100.00", currency: "USD" },
    promotionalPrice: { amount: "80.00", currency: "USD" },
    active: true,
    activePromotion: {
      validFrom: "2026-09-01T00:00:00.000Z",
      validUntil: "2026-09-30T23:59:59.000Z",
    },
    options: { color: "Black", size: "M" },
    availability: { inStock: false },
  },
  {
    id: "red-s",
    sku: "JKT-RED-S",
    listPrice: { amount: "110.00", currency: "USD" },
    active: true,
    options: { color: "Red", size: "S" },
    availability: { inStock: true },
  },
] satisfies Variant[];

describe("variant selection", () => {
  it("hydrates a complete, linkable selection from a variant id", () => {
    expect(selectedOptionsForVariant(variants, "black-m")).toEqual({
      color: "Black",
      size: "M",
    });
    expect(selectedVariant(variants, { color: "Black", size: "M" })?.id).toBe(
      "black-m",
    );
  });

  it("shows a partial selection as a price range", () => {
    expect(matchingPriceRange(variants, { color: "Black" })).toEqual({
      from: { amount: "80.00", currency: "USD" },
      to: { amount: "90.00", currency: "USD" },
    });
  });

  it("marks impossible and zero-stock choices without clearing other dimensions", () => {
    const choices = variantChoices(
      variants,
      { color: "Black", size: "M" },
      "color",
    );
    expect(choices.find((choice) => choice.value === "Red")).toMatchObject({
      impossible: true,
    });
    expect(choices.find((choice) => choice.value === "Black")).toMatchObject({
      outOfStock: true,
    });
    expect({ color: "Black", size: "M" }).toEqual({
      color: "Black",
      size: "M",
    });
  });
});
