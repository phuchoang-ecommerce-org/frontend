import { describe, expect, it } from "vitest";

import { CredentialsRequestSchema, SessionSchema } from "./session";

describe("CredentialsRequestSchema", () => {
  it("accepts valid credentials", () => {
    expect(
      CredentialsRequestSchema.safeParse({ email: "a@example.com", password: "x" }).success,
    ).toBe(true);
  });

  it("rejects an unknown field", () => {
    expect(
      CredentialsRequestSchema.safeParse({
        email: "a@example.com",
        password: "x",
        extra: true,
      }).success,
    ).toBe(false);
  });
});

describe("SessionSchema", () => {
  it("tolerates an unrecognized account status (open vocabulary)", () => {
    const result = SessionSchema.safeParse({
      accessToken: "jwt",
      expiresIn: 3600,
      account: {
        id: "018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e12",
        email: "a@example.com",
        status: "SOME_FUTURE_STATUS",
        verificationStatus: "VERIFIED",
        roles: ["CUSTOMER"],
        createdAt: "2026-01-01T00:00:00Z",
      },
    });
    expect(result.success).toBe(true);
  });
});
