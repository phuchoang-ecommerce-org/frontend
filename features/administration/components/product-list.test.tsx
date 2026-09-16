import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

import { ProductList } from "./product-list";

const products = [
  {
    id: "018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e12",
    name: "Trail Runner Jacket",
    slug: "trail-runner-jacket",
    publicationStatus: "DRAFT",
    brand: "Northpeak",
    inStock: true,
  },
];

describe("ProductList", () => {
  it("supports the dense table keyboard selection path", async () => {
    const user = userEvent.setup();
    render(<ProductList products={products} />);

    const checkbox = screen.getByLabelText("Select Trail Runner Jacket");
    checkbox.focus();
    expect(checkbox).toHaveFocus();
    await user.keyboard(" ");
    expect(screen.getByLabelText("Select Trail Runner Jacket")).toBeChecked();
    await user.tab();
    expect(
      screen.getByRole("link", { name: "Trail Runner Jacket" }),
    ).toHaveFocus();
  });

  it("has no axe violations", async () => {
    const { container } = render(<ProductList products={products} />);
    expect((await axe(container)).violations).toHaveLength(0);
  });
});
