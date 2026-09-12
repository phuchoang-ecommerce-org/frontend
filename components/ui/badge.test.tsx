import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import { Badge } from "./badge";

describe("Badge", () => {
  it("renders its label", () => {
    render(<Badge>Verified</Badge>);
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<Badge>Verified</Badge>);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});
