import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const backendRequest = vi.hoisted(() => vi.fn());
vi.mock("./backend", () => ({ backendRequest }));

import { adjustInventoryStock, listInventoryStock } from "./inventory";

describe("inventory API client", () => {
  afterEach(() => vi.clearAllMocks());

  it("uses the protected stock-list operation without a client cache", async () => {
    backendRequest.mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              id: "stock-item",
              sku: "SKU-1",
              warehouseId: "warehouse",
              warehouseCode: "WH-1",
              quantityOnHand: 10,
              quantityReserved: 3,
              availableQuantity: 7,
            },
          ],
          page: { size: 1, next: null },
        }),
      ),
    );

    await expect(listInventoryStock("access-token")).resolves.toHaveLength(1);
    expect(backendRequest).toHaveBeenCalledWith("/stock-items?size=50", {
      headers: { Authorization: "Bearer access-token" },
      cache: "no-store",
    });
  });

  it("uses the contract adjustment method and endpoint", async () => {
    backendRequest.mockResolvedValue(new Response(null, { status: 201 }));

    await adjustInventoryStock("access-token", "stock-item", {
      delta: 4,
      reasonCode: "RECEIPT",
      reason: "Delivery received",
    });

    expect(backendRequest).toHaveBeenCalledWith(
      "/stock-items/stock-item/adjustments",
      expect.objectContaining({
        method: "POST",
        headers: { Authorization: "Bearer access-token" },
        cache: "no-store",
      }),
    );
  });
});
