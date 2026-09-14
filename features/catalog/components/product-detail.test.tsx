import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

const queries = vi.hoisted(() => ({
  getProductRatingSummary: vi.fn(),
  listProductReviews: vi.fn(),
  listProductVariants: vi.fn(),
  listRelatedProducts: vi.fn(),
}));

vi.mock("../server/queries", () => queries);
vi.mock("./variant-selector", () => ({
  VariantSelector: () => <div>Variant selector</div>,
}));

import {
  AvailabilitySection,
  ProductPrimary,
  RecommendationsSection,
  ReviewsSection,
} from "./product-detail";

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
  queries.getProductRatingSummary.mockResolvedValue({
    reviewCount: 0,
    distribution: {},
  });
  queries.listProductReviews.mockResolvedValue([]);
  queries.listRelatedProducts.mockResolvedValue([
    {
      id: "018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e99",
      name: "Trail Cap",
      slug: "trail-cap",
      publicationStatus: "PUBLISHED",
    },
  ]);
}

afterEach(() => vi.clearAllMocks());

describe("product detail section boundaries", () => {
  it("renders the product and all independent sections", async () => {
    healthyResponses();
    const [availability, reviews, recommendations] = await Promise.all([
      AvailabilitySection({ productId: product.id }),
      ReviewsSection({ productId: product.id }),
      RecommendationsSection({ productId: product.id }),
    ]);
    const { getByRole, container } = render(
      <>
        <ProductPrimary product={product} />
        {availability}
        {reviews}
        {recommendations}
      </>,
    );
    expect(
      getByRole("heading", { name: "Trail Runner Jacket" }),
    ).toBeInTheDocument();
    expect(getByRole("heading", { name: "Availability" })).toBeInTheDocument();
    expect(getByRole("heading", { name: "Reviews" })).toBeInTheDocument();
    expect(
      getByRole("heading", { name: "Related products" }),
    ).toBeInTheDocument();
    expect((await axe(container)).violations).toHaveLength(0);
  });

  it("keeps the primary, reviews, and recommendations when availability fails", async () => {
    healthyResponses();
    queries.listProductVariants.mockRejectedValue(new Error("availability"));
    const [availability, reviews, recommendations] = await Promise.all([
      AvailabilitySection({ productId: product.id }),
      ReviewsSection({ productId: product.id }),
      RecommendationsSection({ productId: product.id }),
    ]);
    const { getByText } = render(
      <>
        <ProductPrimary product={product} />
        {availability}
        {reviews}
        {recommendations}
      </>,
    );
    expect(getByText("Trail Runner Jacket")).toBeInTheDocument();
    expect(getByText("Availability is advisory")).toBeInTheDocument();
    expect(getByText("Reviews")).toBeInTheDocument();
    expect(getByText("Related products")).toBeInTheDocument();
  });

  it("degrades review and recommendation failures without replacing the primary page", async () => {
    healthyResponses();
    queries.getProductRatingSummary.mockRejectedValue(new Error("reviews"));
    queries.listRelatedProducts.mockRejectedValue(new Error("recommendations"));
    const [availability, reviews, recommendations] = await Promise.all([
      AvailabilitySection({ productId: product.id }),
      ReviewsSection({ productId: product.id }),
      RecommendationsSection({ productId: product.id }),
    ]);
    const { getByText, queryByText } = render(
      <>
        <ProductPrimary product={product} />
        {availability}
        {reviews}
        {recommendations}
      </>,
    );
    expect(getByText("Trail Runner Jacket")).toBeInTheDocument();
    expect(getByText("Availability")).toBeInTheDocument();
    expect(getByText("Reviews unavailable")).toBeInTheDocument();
    expect(queryByText("Related products")).not.toBeInTheDocument();
  });
});
