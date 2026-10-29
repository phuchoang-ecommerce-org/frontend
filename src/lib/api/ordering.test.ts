import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const backendRequest = vi.hoisted(() => vi.fn());
vi.mock("./backend", () => ({ backendRequest }));

import {
  initiateCheckout,
  parseCheckout,
  parseOrderSummary,
  setCheckoutShippingAddress,
} from "./ordering";

const checkout = {
  order: {
    id: "checkout-1",
    orderNumber: "DRAFT-1",
    status: "DRAFT",
    currency: "VND",
    lines: [
      {
        id: "line-1",
        variantId: "variant-1",
        sku: "SKU-1",
        productName: "Jacket",
        quantity: 1,
        unitPriceAtOrder: { amount: "129.9900", currency: "VND" },
        lineTotal: { amount: "129.9900", currency: "VND" },
      },
    ],
    subtotal: { amount: "129.9900", currency: "VND" },
    total: { amount: "129.9900", currency: "VND" },
    createdAt: "2026-10-29T08:00:00.000Z",
  },
  ready: false,
};

describe("checkout API boundary", () => {
  afterEach(() => vi.clearAllMocks());

  it("uses an authenticated, uncached request when initiating checkout", async () => {
    backendRequest.mockResolvedValueOnce(
      new Response(JSON.stringify(checkout), { status: 201 }),
    );

    await expect(initiateCheckout("access-token")).resolves.toEqual(checkout);
    expect(backendRequest).toHaveBeenCalledWith("/checkouts", {
      method: "POST",
      headers: { Authorization: "Bearer access-token" },
      cache: "no-store",
    });
  });

  it("sends the documented address selection and preserves no-store", async () => {
    backendRequest.mockResolvedValueOnce(new Response(JSON.stringify(checkout)));
    const selection = { addressId: "address-1", saveToAddressBook: true };

    await setCheckoutShippingAddress("access-token", "checkout/1", selection);

    expect(backendRequest).toHaveBeenCalledWith(
      "/checkouts/checkout%2F1/shipping-address",
      {
        method: "PUT",
        headers: { Authorization: "Bearer access-token" },
        body: JSON.stringify(selection),
        cache: "no-store",
      },
    );
  });

  it("rejects a backend number for Money.amount instead of doing arithmetic", () => {
    const invalid = structuredClone(checkout);
    invalid.order.total.amount = 129.99 as unknown as string;

    expect(() => parseCheckout(invalid)).toThrow();
  });

  it("rejects a review response without its confirmation token", () => {
    expect(() => parseOrderSummary({ order: checkout.order, changed: false })).toThrow();
  });
});
