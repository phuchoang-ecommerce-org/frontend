import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Get started</Button>);
    expect(
      screen.getByRole("button", { name: "Get started" }),
    ).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<Button>Get started</Button>);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});
