import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it, vi } from "vitest";
import { AlertCircle } from "lucide-react";

import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders exactly one primary action alongside the title", () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        icon={AlertCircle}
        title="We couldn't sign you in with those details."
        action={{ label: "Try again", onClick }}
      />,
    );
    expect(screen.getByText("We couldn't sign you in with those details.")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("announces via role=status without requiring focus", () => {
    render(
      <EmptyState icon={AlertCircle} title="Nothing here" action={{ label: "Go home", href: "/" }} />,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders its action at the 44x44px touch-target size (inherits Button)", () => {
    render(
      <EmptyState icon={AlertCircle} title="Nothing here" action={{ label: "Go home", href: "/" }} />,
    );
    expect(screen.getByRole("link", { name: "Go home" }).className).toMatch(/h-control\b/);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <EmptyState
        icon={AlertCircle}
        title="We couldn't sign you in with those details."
        action={{ label: "Try again", onClick: vi.fn() }}
      />,
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});
