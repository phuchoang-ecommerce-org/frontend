import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("../server/inventory-actions", () => ({
  recordInventoryAdjustment: vi.fn(),
}));

import { InventoryAdjustments } from "./inventory-adjustments";

const snapshot = {
  stockItems: [
    {
      sku: "TRJ-BLK-M",
      productName: "Trail Runner Jacket — Black, M",
      onHand: 14,
      reserved: 6,
      available: 8,
      holdingOrders: ["ECP-10482", "ECP-10491"],
    },
  ],
  adjustments: [
    {
      id: "mock-adjustment-002",
      sku: "TRJ-BLK-M",
      delta: -2,
      reason: "Cycle count reconciliation",
      actor: "Warehouse operator",
      recordedAt: "2026-09-16T08:30:00.000Z",
      beforeAvailable: 10,
      afterAvailable: 8,
    },
  ],
};

describe("InventoryAdjustments", () => {
  it("keeps the adjustment form usable by keyboard", async () => {
    const user = userEvent.setup();
    render(<InventoryAdjustments snapshot={snapshot} />);

    const sku = screen.getByLabelText("SKU");
    sku.focus();
    await user.selectOptions(sku, "TRJ-BLK-M");
    await user.tab();
    expect(screen.getByLabelText("Quantity change")).toHaveFocus();
  });

  it("has no axe violations for the stock-history and adjustment flow", async () => {
    const { container } = render(<InventoryAdjustments snapshot={snapshot} />);
    expect((await axe(container)).violations).toHaveLength(0);
  });
});
