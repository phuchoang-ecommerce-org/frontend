/**
 * Contract test for `listOrders` against Prism (Gate G2 check #8 — envelope
 * and cursor shape, not row content). This sprint's `ordering` module does
 * not exist on the real backend yet (Sprint 18) — against the real API this
 * returns an empty page by design (sprint-05-identity-account.md Integration
 * Risk note).
 *
 * Raw `fetch`, not the typed `listOrders` query: Prism's dynamic example
 * generator fills the top-level `Order.currency` field (no explicit example
 * in the spec, unlike `Money.currency`) with the literal `"string"`,
 * ignoring its `^[A-Z]{3}$` pattern — so `OrderSchema.parse` always fails
 * against this mock regardless of contract correctness (see the same
 * Prism limitation documented in account.contract.test.ts). This test
 * therefore asserts envelope/cursor structural shape directly, which is the
 * property G2 check #8 actually cares about.
 */
import { describe, expect, it } from "vitest";

const MOCK_BASE_URL = "http://localhost:4010";

async function isMockReachable(): Promise<boolean> {
  try {
    const response = await fetch(`${MOCK_BASE_URL}/products/018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e12`);
    return response.ok;
  } catch {
    return false;
  }
}

const mockReachable = await isMockReachable();
if (!mockReachable) {
  console.warn(
    "[contract] Prism mock unreachable at localhost:4010 — run `npm run mock:api` first. Skipping.",
  );
}

describe.skipIf(!mockReachable)("ordering contract (against Prism mock)", () => {
  it("listOrders: envelope/cursor shape matches PageEnvelope (G2 check #8)", async () => {
    const response = await fetch(`${MOCK_BASE_URL}/orders`, {
      headers: { Authorization: "Bearer contract-test-token" },
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { items: unknown[]; page: { next?: string } };
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.page.next === undefined || typeof body.page.next === "string").toBe(true);
  });
});
