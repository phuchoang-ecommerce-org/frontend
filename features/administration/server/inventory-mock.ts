import "server-only";

import type { InventoryAdjustmentInput } from "../schema/inventory";

export interface MockStockItem {
  sku: string;
  productName: string;
  onHand: number;
  reserved: number;
  available: number;
  holdingOrders: string[];
}

export interface MockStockAdjustment {
  id: string;
  sku: string;
  delta: number;
  reason: string;
  actor: string;
  recordedAt: string;
  beforeAvailable: number;
  afterAvailable: number;
}

export interface MockInventorySnapshot {
  stockItems: MockStockItem[];
  adjustments: MockStockAdjustment[];
}

export type MockAdjustmentResult =
  | { ok: true; adjustment: MockStockAdjustment }
  | {
      ok: false;
      code: "ECP-INV-4091";
      reservedQuantity: number;
      holdingOrders: string[];
    };

const stockItems: MockStockItem[] = [
  {
    sku: "TRJ-BLK-M",
    productName: "Trail Runner Jacket — Black, M",
    onHand: 14,
    reserved: 6,
    available: 8,
    holdingOrders: ["ECP-10482", "ECP-10491"],
  },
  {
    sku: "TRJ-OLV-L",
    productName: "Trail Runner Jacket — Olive, L",
    onHand: 21,
    reserved: 3,
    available: 18,
    holdingOrders: ["ECP-10477"],
  },
];

const adjustments: MockStockAdjustment[] = [
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
  {
    id: "mock-adjustment-001",
    sku: "TRJ-OLV-L",
    delta: 4,
    reason: "Received from returns inspection",
    actor: "Warehouse operator",
    recordedAt: "2026-09-15T15:10:00.000Z",
    beforeAvailable: 14,
    afterAvailable: 18,
  },
];

/** Sprint 9 stand-in for `listStockAdjustments`; Inventory API arrives in Sprint 11–12. */
export function listMockStockAdjustments(): MockInventorySnapshot {
  return {
    stockItems: stockItems.map((item) => ({
      ...item,
      holdingOrders: [...item.holdingOrders],
    })),
    adjustments: adjustments.map((adjustment) => ({ ...adjustment })),
  };
}

export function recordMockStockAdjustment(
  input: InventoryAdjustmentInput,
): MockAdjustmentResult {
  const stockItem = stockItems.find((item) => item.sku === input.sku);
  if (!stockItem) {
    return {
      ok: false,
      code: "ECP-INV-4091",
      reservedQuantity: 0,
      holdingOrders: [],
    };
  }

  const afterAvailable = stockItem.available + input.delta;
  if (afterAvailable < 0) {
    return {
      ok: false,
      code: "ECP-INV-4091",
      reservedQuantity: stockItem.reserved,
      holdingOrders: [...stockItem.holdingOrders],
    };
  }

  const adjustment: MockStockAdjustment = {
    id: `mock-adjustment-${Date.now()}`,
    sku: stockItem.sku,
    delta: input.delta,
    reason: input.reason,
    actor: "Warehouse operator",
    recordedAt: new Date().toISOString(),
    beforeAvailable: stockItem.available,
    afterAvailable,
  };
  stockItem.onHand += input.delta;
  stockItem.available = afterAvailable;
  adjustments.unshift(adjustment);
  return { ok: true, adjustment };
}
