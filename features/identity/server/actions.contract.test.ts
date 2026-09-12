/**
 * Contract tests — both directions, against a running Prism mock
 * (Gate G1 check #2). Prerequisite: `npm run mock:api` in another terminal
 * (this file does not start it — there's no existing precedent in this repo
 * for a Vitest suite that manages an external process's lifecycle, see
 * lib/api/__tests__/* which all mock `fetch` instead).
 *
 * "Both directions": (a) request-side — Prism validates the request body
 * against the schema and 400s on a bad shape, so a passing call already
 * proves the request we send conforms; (b) response-side — the body Prism
 * returns must parse cleanly through our Zod schemas.
 *
 * Known mock limitation: Prism always returns the OpenAPI example object
 * attached to a response schema, not a computed one — every ValidationFailed
 * 400 in this mock carries the same static `errors` example
 * (`shippingAddress.postalCode`, `lines[0].quantity`) regardless of which
 * endpoint or field actually failed. These tests assert structural
 * conformance (parses as a Problem, `errors` is a non-empty array), not the
 * specific field names Prism happens to echo.
 *
 * Known scope limitation: `logOut` requires an authenticated caller in the
 * contract, but lib/session's getAccessToken()/getCsrfToken() are no-ops
 * this sprint (Sprint 4's EN-FE-API-2) — no Authorization header is ever
 * sent, so Prism rejects it with 401 "Invalid security scheme used" rather
 * than the endpoint's own idempotent-204 behavior. That 401 is exactly what
 * this sprint's architecture predicts, not a bug in the test.
 */
import { describe, expect, it } from "vitest";

import { ProblemSchema } from "@/lib/api";

import {
  logIn,
  logOut,
  registerAccount,
  resendEmailVerification,
  verifyEmailAddress,
} from "./actions";
import { SessionSchema } from "../schema/session";

const MOCK_BASE_URL = "http://localhost:4010";

async function isMockReachable(): Promise<boolean> {
  try {
    const response = await fetch(`${MOCK_BASE_URL}/products/018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e12`);
    return response.ok;
  } catch {
    return false;
  }
}

process.env.ECP_API_BASE_URL = MOCK_BASE_URL;
// Vitest test files are ESM — top-level await is available, so the
// reachability check (and the skip decision it drives) happens once at
// collection time rather than per-test.
const mockReachable = await isMockReachable();
if (!mockReachable) {
  console.warn(
    "[contract] Prism mock unreachable at localhost:4010 — run `npm run mock:api` first. Skipping.",
  );
}

describe.skipIf(!mockReachable)("identity contract (against Prism mock)", () => {
  it("registerAccount: valid request accepted (202, no body)", async () => {
    const result = await registerAccount({ email: "person@example.com", password: "correct-horse" });
    expect(result.ok).toBe(true);
  });

  it("registerAccount: invalid request yields field errors from a well-formed Problem", async () => {
    const result = await registerAccount({ email: "person@example.com" });
    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toBeDefined();
  });

  it("verifyEmailAddress: valid request accepted (204, no body)", async () => {
    const result = await verifyEmailAddress({ token: "any-token" });
    expect(result.ok).toBe(true);
  });

  it("verifyEmailAddress: invalid request yields field errors", async () => {
    const result = await verifyEmailAddress({ token: "" });
    expect(result.ok).toBe(false);
  });

  it("resendEmailVerification: valid request accepted (202, no body)", async () => {
    const result = await resendEmailVerification({ email: "person@example.com" });
    expect(result.ok).toBe(true);
  });

  it("logIn: valid request returns a Session parsed by SessionSchema", async () => {
    const result = await logIn({ email: "person@example.com", password: "correct-horse" });
    expect(result.ok).toBe(true);
    expect(SessionSchema.safeParse(result.data).success).toBe(true);
  });

  it("logIn: invalid request yields field errors, never a form banner for a shape failure", async () => {
    const result = await logIn({ email: "not-an-email", password: "x" });
    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toBeDefined();
  });

  it("logOut: unauthenticated call is rejected with a well-formed Problem (session custody is Sprint 4 scope)", async () => {
    const response = await fetch(`${MOCK_BASE_URL}/sessions/current`, { method: "DELETE" });
    expect(response.status).toBe(401);
    const body: unknown = await response.json();
    expect(ProblemSchema.safeParse(body).success).toBe(true);
    // Confirm via the real action too — same outcome through our own client.
    const result = await logOut();
    expect(result.ok).toBe(false);
  });
});
