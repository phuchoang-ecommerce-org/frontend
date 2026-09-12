import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import { PaginationControl } from "./pagination";

describe("PaginationControl", () => {
  it("shows the result count and disables Next when there is no more data", () => {
    render(<PaginationControl count={3} hasNext={false} />);
    expect(screen.getByText("Showing 3 results")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <PaginationControl count={20} hasNext nextHref="/account/addresses?cursor=abc" />,
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});
