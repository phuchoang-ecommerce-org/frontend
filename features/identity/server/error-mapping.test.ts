import { describe, expect, it } from "vitest";

import { ApiProblem, ApiTransportError } from "@/lib/api";
import { CsrfError } from "@/lib/session";

import { toActionResult } from "./error-mapping";

function problem(overrides: Partial<ConstructorParameters<typeof ApiProblem>[0]> = {}) {
  return new ApiProblem({
    type: "https://ecp.example/errors/ECP-GEN-4000",
    title: "Request validation failed",
    status: 400,
    code: "ECP-GEN-4000",
    instance: "/accounts",
    errors: [],
    ...overrides,
  });
}

describe("toActionResult", () => {
  it("maps field-level Problem errors onto fieldErrors, never a form banner", () => {
    const result = toActionResult(
      problem({ errors: [{ field: "email", code: "ECP-GEN-4002", detail: "Required." }] }),
    );
    expect(result.fieldErrors).toEqual({ email: "Required." });
    expect(result.formError).toBeUndefined();
  });

  it("maps a non-disclosive 401 (errors: []) to a form-level message, never a field", () => {
    const result = toActionResult(
      problem({ code: "ECP-GEN-4010", status: 401, title: "Not authenticated", errors: [] }),
    );
    expect(result.fieldErrors).toBeUndefined();
    expect(result.formError?.message).toBe("We couldn't sign you in with those details.");
  });

  it("maps a rate-limit Problem to a retryable form-level message", () => {
    const result = toActionResult(
      problem({ code: "ECP-GEN-4290", status: 429, title: "Rate limit exceeded", errors: [] }),
    );
    expect(result.formError?.retryable).toBe(true);
  });

  it("carries retryAfterSeconds through for a 429 so the caller can render the dedicated screen", () => {
    const rateLimited = new ApiProblem(
      {
        type: "https://ecp.example/errors/ECP-GEN-4290",
        title: "Rate limit exceeded",
        status: 429,
        code: "ECP-GEN-4290",
        instance: "/sessions",
        errors: [],
      },
      30,
    );
    const result = toActionResult(rateLimited);
    expect(result.formError?.retryAfterSeconds).toBe(30);
  });

  it("maps a CSRF failure to a retryable, non-disclosive form-level message", () => {
    const result = toActionResult(new CsrfError());
    expect(result.fieldErrors).toBeUndefined();
    expect(result.formError?.retryable).toBe(true);
    expect(result.formError?.message).not.toMatch(/csrf|token/i);
  });

  it("maps a transport failure to a generic retryable message", () => {
    const result = toActionResult(new ApiTransportError("POST /sessions", new Error("timeout")));
    expect(result.formError?.message).toMatch(/went wrong/);
    expect(result.formError?.retryable).toBe(true);
  });
});
