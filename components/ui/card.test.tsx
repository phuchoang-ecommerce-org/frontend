import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

describe("Card", () => {
  it("renders its content", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Wireless headphones</CardTitle>
          <CardDescription>Noise-cancelling, over-ear.</CardDescription>
        </CardHeader>
        <CardContent>$129.00</CardContent>
        <CardFooter>In stock</CardFooter>
      </Card>,
    );
    expect(
      screen.getByRole("heading", { name: "Wireless headphones" }),
    ).toBeInTheDocument();
    expect(screen.getByText("$129.00")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Wireless headphones</CardTitle>
        </CardHeader>
        <CardContent>$129.00</CardContent>
      </Card>,
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});
