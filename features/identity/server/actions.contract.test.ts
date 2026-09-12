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
 * Session custody (EN-FE-API-2, Sprint 4): this file runs outside any
 * Next.js request scope, so next/headers' cookies() is stubbed with an
 * in-memory jar (`cookieJar` below) rather than a real browser round trip.
 * logIn/logOut now require a valid CSRF token (Frontend Architecture.md
 * §4.3) — `primeCsrfCookie()` seeds one the same way a real form's hidden
 * field would. `logOut` still has no session cookie of its own by the time
 * its test runs (no browser involved), so it still exercises the
 * unauthenticated-caller path against Prism, same as before this sprint.
 */
import { describe, beforeEach, expect, it, vi } from "vitest";

import { ProblemSchema } from "@/lib/api";
import { CSRF_COOKIE_NAME } from "@/lib/session/constants";
import { generateCsrfToken, signCsrfToken } from "@/lib/session/csrf";

const { cookieJar } = vi.hoisted(() => ({
  cookieJar: new Map<string, { value: string }>(),
}));

vi.mock("next/headers", () => ({
  cookies: () =>
    Promise.resolve({
      get: (name: string) => cookieJar.get(name),
      set: (name: string, value: string) => {
        cookieJar.set(name, { value });
      },
      delete: (name: string) => {
        cookieJar.delete(name);
      },
    }),
}));

import {
  logIn,
  logOut,
  registerAccount,
  resendEmailVerification,
  verifyEmailAddress,
} from "./actions";

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
process.env.CSRF_SECRET = "contract-test-secret";
// Vitest test files are ESM — top-level await is available, so the
// reachability check (and the skip decision it drives) happens once at
// collection time rather than per-test.
const mockReachable = await isMockReachable();
if (!mockReachable) {
  console.warn(
    "[contract] Prism mock unreachable at localhost:4010 — run `npm run mock:api` first. Skipping.",
  );
}

/** Seeds a valid signed ecp_csrf cookie and returns the value a form would echo back. */
function primeCsrfCookie(): string {
  const signed = signCsrfToken(generateCsrfToken());
  cookieJar.set(CSRF_COOKIE_NAME, { value: signed });
  return signed;
}

describe.skipIf(!mockReachable)("identity contract (against Prism mock)", () => {
  beforeEach(() => {
    cookieJar.clear();
  });

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

  it("logIn: valid request establishes a session and never returns a token to the caller", async () => {
    const result = await logIn({
      email: "person@example.com",
      password: "correct-horse",
      csrfToken: primeCsrfCookie(),
    });
    expect(result.ok).toBe(true);
    expect(result.data?.account).toBeDefined();
    // No access token ever reaches the browser (Frontend Architecture.md §4.4).
    expect(result.data).not.toHaveProperty("accessToken");
    expect(result.data).not.toHaveProperty("refreshToken");
  });

  it("logIn: invalid request yields field errors, never a form banner for a shape failure", async () => {
    const result = await logIn({ email: "not-an-email", password: "x", csrfToken: primeCsrfCookie() });
    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toBeDefined();
  });

  it("logIn: missing/invalid CSRF token is rejected before any request is sent", async () => {
    const result = await logIn({ email: "person@example.com", password: "correct-horse" });
    expect(result.ok).toBe(false);
    expect(result.formError).toBeDefined();
  });

  it("logOut: unauthenticated call is rejected with a well-formed Problem", async () => {
    const response = await fetch(`${MOCK_BASE_URL}/sessions/current`, { method: "DELETE" });
    expect(response.status).toBe(401);
    const body: unknown = await response.json();
    expect(ProblemSchema.safeParse(body).success).toBe(true);
    // Confirm via the real action too — no session cookie exists in this
    // test's cookie jar, so this still exercises the unauthenticated path.
    const result = await logOut({ csrfToken: primeCsrfCookie() });
    expect(result.ok).toBe(false);
  });
});
