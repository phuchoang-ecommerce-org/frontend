import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import { Form, FormField, FormMessage } from "./form";
import { Input } from "./input";

describe("Form", () => {
  it("wires a field error to its input via aria-describedby and aria-invalid", () => {
    render(
      <Form>
        <FormField name="email" label="Email" error="Required.">
          <Input type="email" />
        </FormField>
      </Form>,
    );
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)).toHaveTextContent("Required.");
  });

  it("renders no error wiring when there is no error", () => {
    render(
      <Form>
        <FormField name="email" label="Email">
          <Input type="email" />
        </FormField>
      </Form>,
    );
    const input = screen.getByLabelText("Email");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-describedby");
  });

  it("has no axe violations with an error present", async () => {
    const { container } = render(
      <Form>
        <FormField name="password" label="Password" error="Required.">
          <Input type="password" />
        </FormField>
      </Form>,
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it("FormMessage renders as an alert region", () => {
    render(<FormMessage>Something went wrong.</FormMessage>);
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong.");
  });
});
