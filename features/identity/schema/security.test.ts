import { describe, expect, it } from "vitest";

import { PasswordChangeRequestSchema, PasswordResetRequestSchema, PasswordResetSchema } from "./security";

describe("PasswordChangeRequestSchema", () => {
  it("accepts a valid password change", () => {
    const result = PasswordChangeRequestSchema.safeParse({
      currentPassword: "old-password",
      newPassword: "new-password",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown field (additionalProperties: false)", () => {
    const result = PasswordChangeRequestSchema.safeParse({
      currentPassword: "old-password",
      newPassword: "new-password",
      isAdmin: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing required field", () => {
    const result = PasswordChangeRequestSchema.safeParse({ newPassword: "new-password" });
    expect(result.success).toBe(false);
  });
});

describe("PasswordResetRequestSchema", () => {
  it("accepts a valid email", () => {
    expect(PasswordResetRequestSchema.safeParse({ email: "person@example.com" }).success).toBe(true);
  });

  it("rejects a missing email", () => {
    expect(PasswordResetRequestSchema.safeParse({}).success).toBe(false);
  });
});

describe("PasswordResetSchema", () => {
  it("accepts a valid reset", () => {
    const result = PasswordResetSchema.safeParse({ token: "abc123", newPassword: "new-password" });
    expect(result.success).toBe(true);
  });

  it("rejects a missing token", () => {
    expect(PasswordResetSchema.safeParse({ newPassword: "new-password" }).success).toBe(false);
  });
});
