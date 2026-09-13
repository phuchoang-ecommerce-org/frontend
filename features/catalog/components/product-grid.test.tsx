import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import type { Page } from "@/lib/api";

import type { ProductSummary } from "../schema/category";
import { ProductGrid } from "./product-grid";

const products: Page<ProductSummary> = {
  items: [
    {
      id: "018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e12" as ProductSummary["id"],
      name: "Trail runner jacket",
      slug: "trail-runner-jacket",
      publicationStatus: "PUBLISHED",
      inStock: false,
    },
  ],
  next: null,
};

describe("ProductGrid", () => {
  it("marks an unavailable product while keeping its detail link available", async () => {
    const { container } = render(
      <ProductGrid categoryName="Outerwear" products={products} />,
    );

    expect(
      screen.getByRole("link", { name: /trail runner jacket/i }),
    ).toHaveAttribute("href", "/p/018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e12");
    expect(screen.getByText(/out of stock/i)).toBeVisible();
    expect((await axe(container)).violations).toHaveLength(0);
  });

  it("renders the designed empty state", () => {
    render(
      <ProductGrid
        categoryName="Outerwear"
        products={{ items: [], next: null }}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Nothing in Outerwear yet",
    );
  });
});
