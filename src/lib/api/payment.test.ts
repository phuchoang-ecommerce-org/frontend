import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const backendRequest = vi.hoisted(() => vi.fn());
vi.mock("./backend", () => ({ backendRequest }));

import { listEligiblePaymentMethods, parsePaymentMethods } from "./payment";

describe("payment API boundary", () => {
  afterEach(() => vi.clearAllMocks());

  it("keeps ineligible methods and their reason from the API", async () => {
    const methods = [
      { type: "CARD", eligible: true },
      {
        type: "CASH_ON_DELIVERY",
        eligible: false,
        ineligibleReason: "Unavailable for this destination.",
      },
    ];
    backendRequest.mockResolvedValueOnce(new Response(JSON.stringify(methods)));

    await expect(
      listEligiblePaymentMethods("access-token", "order/1"),
    ).resolves.toEqual(methods);
    expect(backendRequest).toHaveBeenCalledWith(
      "/orders/order%2F1/payment-methods",
      { headers: { Authorization: "Bearer access-token" }, cache: "no-store" },
    );
  });

  it("rejects a malformed payment-method response", () => {
    expect(() => parsePaymentMethods([{ type: "CARD" }])).toThrow();
  });
});
