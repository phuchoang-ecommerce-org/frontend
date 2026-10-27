import { describe, expect, it } from "vitest";
import { devAccountDestination } from "./dev-account-destination";

describe("devAccountDestination", () => {
  it("sends a customer account to the storefront home page", () => {
    expect(devAccountDestination("customer")).toBe("/");
  });

  it("preserves the existing destination for operator accounts", () => {
    expect(devAccountDestination("staff")).toBe("/welcome");
  });
});
