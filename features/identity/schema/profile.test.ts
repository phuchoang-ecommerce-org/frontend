import { describe, expect, it } from "vitest";

import { ProfileUpdateRequestSchema } from "./profile";

describe("ProfileUpdateRequestSchema", () => {
  it("accepts a partial update", () => {
    expect(ProfileUpdateRequestSchema.safeParse({ displayName: "Jane" }).success).toBe(true);
  });

  it("accepts an empty update", () => {
    expect(ProfileUpdateRequestSchema.safeParse({}).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(ProfileUpdateRequestSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
  });

  it("rejects an unknown field (additionalProperties: false)", () => {
    expect(ProfileUpdateRequestSchema.safeParse({ isAdmin: true }).success).toBe(false);
  });
});
