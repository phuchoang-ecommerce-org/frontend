import { describe, expect, it } from "vitest";

import { CORRELATION_ID_HEADER, newCorrelationId } from "./correlation-id";

describe("newCorrelationId", () => {
  it("returns a UUID-shaped string, fresh every call", () => {
    const a = newCorrelationId();
    const b = newCorrelationId();
    expect(a).toMatch(/^[0-9a-f-]{36}$/);
    expect(a).not.toBe(b);
  });
});

describe("CORRELATION_ID_HEADER", () => {
  it("is the contract's header name", () => {
    expect(CORRELATION_ID_HEADER).toBe("X-Correlation-Id");
  });
});
