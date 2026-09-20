import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

const queries = vi.hoisted(() => ({
  listProductVariants: vi.fn(),
}));

vi.mock("../server/queries", () => queries);
vi.mock("./variant-selector", () => ({
  VariantSelector: () => <div>Variant selector</div>,
}));

import { AvailabilitySection, ProductPrimary } from "./product-detail";

const product = {
  id: "018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e12" as never,
  name: "Trail Runner Jacket",
  slug: "trail-runner-jacket",
  publicationStatus: "PUBLISHED",
  categories: [{ id: "outerwear", name: "Outerwear", slug: "outerwear" }],
  images: [],
  variants: [
    {
      id: "black-s",
      sku: "TRJ-BLK-S",
      listPrice: { amount: "90.00", currency: "USD" },
      active: true,
      availability: { inStock: true },
    },
  ],
};

function healthyResponses() {
  queries.listProductVariants.mockResolvedValue(product.variants);
}

afterEach(() => vi.clearAllMocks());

describe("catalog product detail sections", () => {
  it("renders the product and availability section", async () => {
    healthyResponses();
    const availability = await AvailabilitySection({ productId: product.id });
    const { getByRole, container } = render(
      <>
        <ProductPrimary product={product} />
        {availability}
      </>,
    );

    expect(
      getByRole("heading", { name: "Trail Runner Jacket" }),
    ).toBeInTheDocument();
    expect(getByRole("heading", { name: "Availability" })).toBeInTheDocument();
    expect((await axe(container)).violations).toHaveLength(0);
  });

  it("keeps the primary product visible when availability fails", async () => {
    healthyResponses();
    queries.listProductVariants.mockRejectedValue(new Error("availability"));
    const availability = await AvailabilitySection({ productId: product.id });
    const { getByText } = render(
      <>
        <ProductPrimary product={product} />
        {availability}
      </>,
    );

    expect(getByText("Trail Runner Jacket")).toBeInTheDocument();
    expect(getByText("Availability is advisory")).toBeInTheDocument();
  });
});
