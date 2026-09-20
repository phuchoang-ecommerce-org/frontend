"use server";

import { z } from "zod";

import { CsrfError, requireCsrf } from "@/lib/session";

import { InventoryAdjustmentInputSchema } from "../schema/inventory";
import {
  recordMockStockAdjustment,
  type MockStockAdjustment,
} from "./inventory-mock";

export interface InventoryAdjustmentActionResult {
  ok: boolean;
  data?: MockStockAdjustment;
  fieldErrors?: Record<string, string>;
  formError?: string;
  conflict?: {
    code: "ECP-INV-4091";
    reservedQuantity: number;
    holdingOrders: string[];
  };
}

function fieldErrors(error: z.ZodError): Record<string, string> {
  return Object.fromEntries(
    error.issues.map((issue) => [
      issue.path.join(".") || "_form",
      issue.message,
    ]),
  );
}

export async function recordInventoryAdjustment(
  input: unknown,
): Promise<InventoryAdjustmentActionResult> {
  const record =
    input !== null && typeof input === "object"
      ? (input as Record<string, unknown>)
      : {};
  const parsed = InventoryAdjustmentInputSchema.safeParse({
    sku: record.sku,
    delta: record.delta,
    reason: record.reason,
  });
  if (!parsed.success)
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  try {
    await requireCsrf(record.csrfToken);
  } catch (error) {
    if (error instanceof CsrfError) {
      return {
        ok: false,
        formError: "Your session needs to be refreshed. Please try again.",
      };
    }
    throw error;
  }

  const result = recordMockStockAdjustment(parsed.data);
  if (!result.ok) {
    return {
      ok: false,
      conflict: {
        code: result.code,
        reservedQuantity: result.reservedQuantity,
        holdingOrders: result.holdingOrders,
      },
    };
  }
  return { ok: true, data: result.adjustment };
}
