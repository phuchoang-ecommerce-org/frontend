import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const backendRequest = vi.hoisted(() => vi.fn());
vi.mock("./backend", () => ({ backendRequest }));

import {
  getShippingQuotes,
  getOrderTracking,
  listOrderShipments,
  parseShipment,
  parseShippingQuote,
} from "./shipping";

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

  it("loads an order's shipments with an authenticated uncached request", async () => {
    const shipments = [
      {
        id: "shipment-1",
        orderId: "order-1",
        carrier: "Carrier",
        trackingReference: "TRACK-1",
        status: "IN_TRANSIT",
        trackingEvents: [
          {
            id: "event-1",
            status: "IN_TRANSIT",
            carrierOccurredAt: "2026-10-30T10:00:00.000Z",
            receivedAt: "2026-10-30T10:05:00.000Z",
            applied: true,
          },
        ],
        lastUpdateReceivedAt: "2026-10-30T10:05:00.000Z",
        createdAt: "2026-10-29T10:00:00.000Z",
      },
    ];
    backendRequest.mockResolvedValueOnce(new Response(JSON.stringify(shipments)));

    await expect(listOrderShipments("access-token", "order/1")).resolves.toEqual(shipments);
    expect(backendRequest).toHaveBeenCalledWith("/orders/order%2F1/shipments", {
      headers: { Authorization: "Bearer access-token" },
      cache: "no-store",
    });
  });

  it("rejects tracking events without the time the platform received them", () => {
    expect(() =>
      parseShipment({
        id: "shipment-1",
        orderId: "order-1",
        carrier: "Carrier",
        status: "IN_TRANSIT",
        trackingEvents: [
          {
            id: "event-1",
            status: "IN_TRANSIT",
            carrierOccurredAt: "2026-10-30T10:00:00.000Z",
            applied: true,
          },
        ],
        createdAt: "2026-10-29T10:00:00.000Z",
      }),
    ).toThrow();
  });

  it("loads current order tracking without caching", async () => {
    const tracking = {
      orderId: "order-1",
      orderNumber: "EC-1042",
      status: "SHIPPING",
      shipments: [],
      estimatedDeliveryFrom: "2026-11-01T00:00:00.000Z",
      estimatedDeliveryTo: "2026-11-03T00:00:00.000Z",
    };
    backendRequest.mockResolvedValueOnce(new Response(JSON.stringify(tracking)));

    await expect(getOrderTracking("access-token", "order/1")).resolves.toEqual(tracking);
    expect(backendRequest).toHaveBeenCalledWith("/orders/order%2F1/tracking", {
      headers: { Authorization: "Bearer access-token" },
      cache: "no-store",
    });
  });
});
