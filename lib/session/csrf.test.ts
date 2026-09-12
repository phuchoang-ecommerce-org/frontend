import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { generateCsrfToken, signCsrfToken, verifyCsrfToken } from "./csrf";

describe("csrf", () => {
  beforeEach(() => {
    process.env.CSRF_SECRET = "test-secret";
  });

  afterEach(() => {
    delete process.env.CSRF_SECRET;
  });

  it("generates a token and signs it into a verifiable cookie value", () => {
    const token = generateCsrfToken();
    const signed = signCsrfToken(token);
    expect(signed.startsWith(`${token}.`)).toBe(true);
    expect(verifyCsrfToken(signed, signed)).toBe(true);
  });

  it("rejects a submitted value that doesn't match the cookie (double-submit)", () => {
    const signed = signCsrfToken(generateCsrfToken());
    const otherSigned = signCsrfToken(generateCsrfToken());
    expect(verifyCsrfToken(signed, otherSigned)).toBe(false);
  });

  it("rejects a tampered signature even when the token portion matches", () => {
    const token = generateCsrfToken();
    const tampered = `${token}.not-the-real-signature`;
    expect(verifyCsrfToken(tampered, tampered)).toBe(false);
  });

  it("rejects a value with no signature separator", () => {
    expect(verifyCsrfToken("not-signed", "not-signed")).toBe(false);
  });

  it("two tokens for the same secret never collide", () => {
    const a = signCsrfToken(generateCsrfToken());
    const b = signCsrfToken(generateCsrfToken());
    expect(a).not.toBe(b);
  });
});
