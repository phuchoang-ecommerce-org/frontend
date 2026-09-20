import { describe, expect, it, vi } from "vitest";

const requireCsrf = vi.hoisted(() => vi.fn());

vi.mock("@/lib/session", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/session")>()),
  requireCsrf,
}));

import { recordInventoryAdjustment } from "./inventory-actions";

describe("recordInventoryAdjustment", () => {
  it("requires a reason before it checks or records a stock adjustment", async () => {
    const result = await recordInventoryAdjustment({
      csrfToken: "token",
      sku: "TRJ-BLK-M",
      delta: "-1",
      reason: " ",
    });

    expect(result).toMatchObject({
      ok: false,
      fieldErrors: { reason: "A reason is required." },
    });
    expect(requireCsrf).not.toHaveBeenCalled();
  });

  it("returns the designed ECP-INV-4091 state with server-authoritative reservations", async () => {
    requireCsrf.mockResolvedValue(undefined);

    const result = await recordInventoryAdjustment({
      csrfToken: "token",
      sku: "TRJ-BLK-M",
      delta: "-9",
      reason: "Damaged stock write-off",
    });

    expect(result).toMatchObject({
      ok: false,
      conflict: {
        code: "ECP-INV-4091",
        reservedQuantity: 6,
        holdingOrders: ["ECP-10482", "ECP-10491"],
      },
    });
  });
});
