import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

const queries = vi.hoisted(() => ({
  listRelatedProducts: vi.fn(),
}));

vi.mock("../server/queries", () => queries);

import { ProductRecommendationsSection } from "./product-recommendations-section";

const productId = "018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e12" as never;

afterEach(() => vi.clearAllMocks());

describe("product recommendations section", () => {
  it("renders the existing related-products rail", async () => {
    queries.listRelatedProducts.mockResolvedValue([
      {
        id: "018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e99",
        name: "Trail Cap",
        slug: "trail-cap",
        publicationStatus: "PUBLISHED",
        priceFrom: { amount: "25.00", currency: "USD" },
      },
    ]);

    const section = await ProductRecommendationsSection({ productId });
    const { getByRole, container } = render(section);

    expect(
      getByRole("heading", { name: "Related products" }),
    ).toBeInTheDocument();
    expect(getByRole("link", { name: /trail cap/i })).toHaveAttribute(
      "href",
      "/p/018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e99",
    );
    expect((await axe(container)).violations).toHaveLength(0);
  });

  it("silently removes the rail when its read fails", async () => {
    queries.listRelatedProducts.mockRejectedValue(new Error("recommendations"));

    const section = await ProductRecommendationsSection({ productId });
    const { container } = render(section);

    expect(container).toBeEmptyDOMElement();
  });
});
