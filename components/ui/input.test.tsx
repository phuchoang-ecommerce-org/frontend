import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import { Input } from "./input";

describe("Input", () => {
  it("accepts typed input", async () => {
    render(<Input aria-label="Email" />);
    const input = screen.getByRole("textbox", { name: "Email" });
    await userEvent.type(input, "hello@example.com");
    expect(input).toHaveValue("hello@example.com");
  });

  it("shows a visible focus ring instead of removing the outline", () => {
    render(<Input aria-label="Email" />);
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input.className).toMatch(/focus-visible:ring-2/);
  });

  it("has no axe violations", async () => {
    const { container } = render(<Input aria-label="Email" />);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});
