/**
 * Contract tests for Sprint 5's account/security/address operations, against
 * a running Prism mock (Gate G2 check #2) — same structure and the same
 * caveats as actions.contract.test.ts (Prism's static-example limitation,
 * `primeCsrfCookie()`, `describe.skipIf`). These assert structural
 * conformance against Prism, not the real-API property — that's IH-1/G2
 * scope against `ecp-api`, coordinated with the backend session.
 *
 * Additional known Prism limitation found this sprint: Prism's *dynamic*
 * example generator fills every `pattern`-constrained string (e.g.
 * `countryCode: ^[A-Z]{2}$`) with the literal `"string"`, ignoring the
 * pattern — so a response actually parsed through our (correctly strict)
 * `CustomerAddressSchema`/`OrderSchema` always fails Zod validation against
 * this mock, regardless of contract correctness. The address/order tests
 * below hit the mock with a raw `fetch` and assert structural shape (status
 * code, key presence) instead of running the full schema, exactly as
 * `actions.contract.test.ts`'s `logOut` test already does for its own
 * raw-fetch check.
 */
import { describe, beforeEach, expect, it, vi } from "vitest";

import { getAccessToken } from "@/lib/session";
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
  changeOwnPassword,
  completePasswordReset,
  logIn,
  removeOwnAddress,
  requestPasswordReset,
  updateOwnProfile,
} from "./actions";
import { getOwnAccount } from "./queries";

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
const mockReachable = await isMockReachable();
if (!mockReachable) {
  console.warn(
    "[contract] Prism mock unreachable at localhost:4010 — run `npm run mock:api` first. Skipping.",
  );
}

function primeCsrfCookie(): string {
  const signed = signCsrfToken(generateCsrfToken());
  cookieJar.set(CSRF_COOKIE_NAME, { value: signed });
  return signed;
}

/** Every operation in this file is `own`-scoped and requires a session — establish one via a real logIn against Prism first. */
async function authenticate(): Promise<void> {
  const result = await logIn({
    email: "person@example.com",
    password: "correct-horse",
    csrfToken: primeCsrfCookie(),
  });
  if (!result.ok) throw new Error("authenticate() setup failed: " + JSON.stringify(result));
}

const validAddress = {
  recipientName: "Jane Doe",
  line1: "1 Main St",
  city: "Hanoi",
  postalCode: "100000",
  countryCode: "VN",
};

describe.skipIf(!mockReachable)("account/security/address contract (against Prism mock)", () => {
  beforeEach(() => {
    cookieJar.clear();
  });

  it("requestPasswordReset: well-formed request is accepted (202, no body, anonymous)", async () => {
    const result = await requestPasswordReset({ email: "person@example.com" });
    expect(result.ok).toBe(true);
  });

  it("requestPasswordReset: invalid request yields field errors", async () => {
    const result = await requestPasswordReset({ email: "not-an-email" });
    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toBeDefined();
  });

  it("completePasswordReset: well-formed request is accepted (204, no body, anonymous)", async () => {
    const result = await completePasswordReset({ token: "any-token", newPassword: "new-password" });
    expect(result.ok).toBe(true);
  });

  it("getOwnAccount: response parses as Account", async () => {
    await authenticate();
    const account = await getOwnAccount();
    expect(account.id).toBeDefined();
    expect(account.email).toBeDefined();
  });

  it("updateOwnProfile: valid request returns a parsed Account", async () => {
    await authenticate();
    const result = await updateOwnProfile({ displayName: "Jane", csrfToken: primeCsrfCookie() });
    expect(result.ok).toBe(true);
    expect(result.data?.id).toBeDefined();
  });

  it("changeOwnPassword: valid request accepted (204, no body)", async () => {
    await authenticate();
    const result = await changeOwnPassword({
      currentPassword: "old-password",
      newPassword: "new-password",
      csrfToken: primeCsrfCookie(),
    });
    expect(result.ok).toBe(true);
  });

  it("changeOwnPassword: missing CSRF token is rejected before any request is sent", async () => {
    const result = await changeOwnPassword({ currentPassword: "old-password", newPassword: "new-password" });
    expect(result.ok).toBe(false);
    expect(result.formError).toBeDefined();
  });

  it("listOwnAddresses: envelope/cursor shape matches PageEnvelope (G2 check #8, raw fetch — see Prism limitation note above)", async () => {
    await authenticate();
    const accessToken = await getAccessToken();
    const response = await fetch(`${MOCK_BASE_URL}/accounts/me/addresses`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { items: unknown[]; page: { next?: string } };
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.page.next === undefined || typeof body.page.next === "string").toBe(true);
  });

  it("addOwnAddress: well-formed request is accepted (201, raw fetch — see Prism limitation note above)", async () => {
    await authenticate();
    const accessToken = await getAccessToken();
    const response = await fetch(`${MOCK_BASE_URL}/accounts/me/addresses`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(validAddress),
    });
    expect(response.status).toBe(201);
    const body = (await response.json()) as { id: unknown };
    expect(body.id).toBeDefined();
  });

  it("getOwnAddress: response has the CustomerAddress shape (raw fetch — see Prism limitation note above)", async () => {
    await authenticate();
    const accessToken = await getAccessToken();
    const response = await fetch(`${MOCK_BASE_URL}/accounts/me/addresses/018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e12`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { id: unknown };
    expect(body.id).toBeDefined();
  });

  it("replaceOwnAddress: well-formed request is accepted (200, raw fetch — see Prism limitation note above)", async () => {
    await authenticate();
    const accessToken = await getAccessToken();
    const response = await fetch(`${MOCK_BASE_URL}/accounts/me/addresses/018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e12`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(validAddress),
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { id: unknown };
    expect(body.id).toBeDefined();
  });

  it("removeOwnAddress: accepted (204, idempotent)", async () => {
    await authenticate();
    const result = await removeOwnAddress("018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e12", {
      csrfToken: primeCsrfCookie(),
    });
    expect(result.ok).toBe(true);
  });
});
