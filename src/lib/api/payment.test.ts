import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const backendRequest = vi.hoisted(() => vi.fn());
vi.mock("./backend", () => ({ backendRequest }));

import { getOrderPayment, initiatePayment, listEligiblePaymentMethods, parsePayment, parsePaymentInitiationResult, parsePaymentMethods } from "./payment";

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

  it("loads an uncached payment separately from the order snapshot", async () => {
    const payment = {
      id: "payment-1",
      orderId: "order/1",
      method: "CARD",
      currency: "VND",
      status: "PENDING",
    };
    backendRequest.mockResolvedValueOnce(new Response(JSON.stringify(payment)));

    await expect(getOrderPayment("access-token", "order/1")).resolves.toEqual(payment);
    expect(backendRequest).toHaveBeenCalledWith("/orders/order%2F1/payment", {
      headers: { Authorization: "Bearer access-token" },
      cache: "no-store",
    });
  });

  it("rejects a malformed payment response", () => {
    expect(() => parsePayment({ id: "payment-1", orderId: "order-1", method: "CARD" })).toThrow();
  });

  it("starts payment with only an order, method, and stable idempotency key", async () => {
    const result = {
      payment: { id: "payment-1", orderId: "order-1", method: "CARD", currency: "VND", status: "PENDING" },
      attempt: { id: "attempt-1", paymentId: "payment-1", attemptNumber: 1, amount: { amount: "10.00", currency: "VND" }, outcome: "PENDING", requestedAt: "2026-10-30T00:00:00.000Z" },
    };
    backendRequest.mockResolvedValueOnce(new Response(JSON.stringify(result), { status: 202 }));

    await expect(initiatePayment("access-token", { orderId: "order-1", method: "CARD" }, "stable-key"))
      .resolves.toEqual({ result, status: 202 });
    expect(backendRequest).toHaveBeenCalledWith("/payments", {
      method: "POST",
      headers: { Authorization: "Bearer access-token", "Idempotency-Key": "stable-key" },
      body: JSON.stringify({ orderId: "order-1", method: "CARD" }),
      cache: "no-store",
    });
  });

  it("rejects an incomplete payment initiation response", () => {
    expect(() => parsePaymentInitiationResult({ payment: {} })).toThrow();
  });
});
