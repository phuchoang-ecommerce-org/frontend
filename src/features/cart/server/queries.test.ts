import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("@/lib/api/backend", () => ({ backendRequest: vi.fn() }));
vi.mock("@/lib/session", () => ({ getSession: vi.fn() }));

import { cartDisplay, type CartWire } from "./queries";

const baseCart: CartWire = {
  id: "cart-id",
  status: "ACTIVE",
  subtotal: { amount: "24.00", currency: "USD" },
  expiresAt: "2026-11-01T00:00:00Z",
  lines: [
    {
      id: "line-id",
      variantId: "variant-id",
      sku: "SKU-1",
      quantity: 3,
      unitPrice: { amount: "8.00", currency: "USD" },
      lineTotal: { amount: "24.00", currency: "USD" },
    },
  ],
};
const baseLine = baseCart.lines[0]!;

describe("cartDisplay", () => {
  it("shows a price-change notice without blocking an otherwise purchasable cart", () => {
    const display = cartDisplay({
      ...baseCart,
      lines: [{ ...baseLine, priceChanged: true }],
    });

    expect(display.lines[0]).toMatchObject({
      priceChanged: true,
      stockShort: false,
    });
    expect(display.totals.canCheckout).toBe(true);
  });

  it("blocks checkout for a stock shortfall while retaining the selected quantity", () => {
    const display = cartDisplay({
      ...baseCart,
      lines: [{ ...baseLine, stockShort: true }],
    });

    expect(display.lines[0]).toMatchObject({ quantity: 3, stockShort: true });
    expect(display.totals).toMatchObject({
      canCheckout: false,
      checkoutMessage:
        "Reduce the quantities marked with low stock before checkout.",
    });
  });
});
