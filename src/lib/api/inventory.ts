import "server-only";

import { z } from "zod";
import { backendRequest } from "./backend";
import type { components } from "./types";

export type InventoryAdjustmentWrite =
  components["schemas"]["StockAdjustmentWrite"];

const stockItemSchema = z.object({
  id: z.string().min(1),
  sku: z.string().min(1),
  warehouseId: z.string().min(1),
  warehouseCode: z.string().nullish(),
  quantityOnHand: z.number().int().nonnegative(),
  quantityReserved: z.number().int().nonnegative(),
  availableQuantity: z.number().int().nonnegative(),
  updatedAt: z.string().nullish(),
});
const stockItemPageSchema = z.object({
  items: z.array(stockItemSchema),
  page: z.object({
    size: z.number().int().nonnegative(),
    next: z.string().nullish(),
  }),
});

export type InventoryStockItem = z.infer<typeof stockItemSchema>;

function bearer(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

export async function listInventoryStock(
  accessToken: string,
): Promise<InventoryStockItem[]> {
  const response = await backendRequest("/stock-items?size=50", {
    headers: bearer(accessToken),
    cache: "no-store",
  });
  if (!response.ok) throw response;
  return stockItemPageSchema.parse(await response.json()).items;
}

export function adjustInventoryStock(
  accessToken: string,
  stockItemId: string,
  adjustment: InventoryAdjustmentWrite,
): Promise<Response> {
  return backendRequest(
    `/stock-items/${encodeURIComponent(stockItemId)}/adjustments`,
    {
      method: "POST",
      headers: bearer(accessToken),
      body: JSON.stringify(adjustment),
      cache: "no-store",
    },
  );
}
