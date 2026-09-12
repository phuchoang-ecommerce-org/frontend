import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { Button } from "./button";

function renderTooltip() {
  return render(
    <TooltipProvider>
      <Tooltip open>
        <TooltipTrigger asChild>
          <Button aria-label="Remove address">Remove</Button>
        </TooltipTrigger>
        <TooltipContent>Remove this address</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  );
}

describe("Tooltip", () => {
  it("renders its content when open", () => {
    renderTooltip();
    expect(screen.getByRole("tooltip", { name: "Remove this address" })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = renderTooltip();
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});
