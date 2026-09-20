import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

const queries = vi.hoisted(() => ({
  getProductRatingSummary: vi.fn(),
  listProductReviews: vi.fn(),
}));

vi.mock("../server/queries", () => queries);

import { ProductReviewsSection } from "./product-reviews-section";

const productId = "018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e12" as never;

afterEach(() => vi.clearAllMocks());

describe("product reviews section", () => {
  it("renders the existing rating and review states", async () => {
    queries.getProductRatingSummary.mockResolvedValue({
      averageRating: 4.5,
      reviewCount: 1,
      distribution: { "5": 1 },
    });
    queries.listProductReviews.mockResolvedValue([
      {
        id: "review-1",
        rating: 5,
        title: "A great jacket",
        body: "Warm and lightweight.",
        authorDisplayName: "Casey",
      },
    ]);

    const section = await ProductReviewsSection({ productId });
    const { getByRole, getByText, container } = render(section);

    expect(getByRole("heading", { name: "Reviews" })).toBeInTheDocument();
    expect(getByText("4.5 / 5 · 1 reviews")).toBeInTheDocument();
    expect(getByText("A great jacket")).toBeInTheDocument();
    expect((await axe(container)).violations).toHaveLength(0);
  });

  it("keeps the designed empty state when its read fails", async () => {
    queries.getProductRatingSummary.mockRejectedValue(new Error("reviews"));
    queries.listProductReviews.mockResolvedValue([]);

    const section = await ProductReviewsSection({ productId });
    const { getByText } = render(section);

    expect(getByText("Reviews unavailable")).toBeInTheDocument();
    expect(
      getByText(
        "Reviews are unavailable right now. Product details and options are still available.",
      ),
    ).toBeInTheDocument();
  });
});
