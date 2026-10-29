import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const backendRequest = vi.hoisted(() => vi.fn());
vi.mock("./backend", () => ({ backendRequest }));

import { getShippingQuotes, parseShippingQuote } from "./shipping";

describe("shipping API boundary", () => {
  afterEach(() => vi.clearAllMocks());

  it("reads a quote through an authenticated uncached request", async () => {
    const quote = {
      options: [
        {
          id: "standard",
          carrier: "Carrier",
          fee: { amount: "5000.0000", currency: "VND" },
        },
      ],
      shipmentCount: 1,
    };
    backendRequest.mockResolvedValueOnce(new Response(JSON.stringify(quote)));

    await expect(
      getShippingQuotes("access-token", {
        checkoutId: "checkout-1",
        countryCode: "VN",
      }),
    ).resolves.toEqual(quote);
    expect(backendRequest).toHaveBeenCalledWith(
      "/shipping-quotes?checkoutId=checkout-1&countryCode=VN",
      { headers: { Authorization: "Bearer access-token" }, cache: "no-store" },
    );
  });

  it("rejects a numeric shipping fee", () => {
    expect(() =>
      parseShippingQuote({
        options: [
          { id: "standard", carrier: "Carrier", fee: { amount: 5000, currency: "VND" } },
        ],
      }),
    ).toThrow();
  });
});
