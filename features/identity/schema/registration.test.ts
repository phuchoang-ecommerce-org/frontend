import { describe, expect, it } from "vitest";

import { RegistrationRequestSchema } from "./registration";

describe("RegistrationRequestSchema", () => {
  it("accepts a valid registration", () => {
    const result = RegistrationRequestSchema.safeParse({
      email: "person@example.com",
      password: "correct horse battery staple",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown field (additionalProperties: false)", () => {
    const result = RegistrationRequestSchema.safeParse({
      email: "person@example.com",
      password: "x",
      isAdmin: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing required field", () => {
    const result = RegistrationRequestSchema.safeParse({ email: "person@example.com" });
    expect(result.success).toBe(false);
  });
});
