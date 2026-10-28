"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { adjustInventoryStock, type InventoryAdjustmentWrite } from "@/lib/api/inventory";
import { fieldErrors, problemMessage, readProblem } from "@/lib/api/backend";
import { getSession } from "@/lib/session";
import { canAdjustInventory } from "@/lib/session/roles";
import { checkActionCsrf } from "@/lib/session/csrf";
import type { StockAdjustment } from "../types";

export type InventoryActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string; errors?: Record<string, string> };

const adjustmentSchema = z.object({
  delta: z.number().int().refine((value) => value !== 0, "Enter a non-zero whole number."),
  reasonCode: z.string().trim().min(1, "Choose a reason code."),
  reason: z.string().trim().min(1, "Enter an explanation."),
});
const stockItemIdSchema = z.string().trim().min(1, "Invalid stock record.");

export async function adjustStockAction(
  stockItemId: string,
  values: StockAdjustment,
  csrfToken: string,
): Promise<InventoryActionResult> {
  if (!(await checkActionCsrf(csrfToken))) {
    return { ok: false, message: "Reload the page and try again." };
  }
  const parsedStockItemId = stockItemIdSchema.safeParse(stockItemId);
  if (!parsedStockItemId.success) {
    return { ok: false, message: "Invalid stock record." };
  }
  const session = await getSession();
  if (!session) return { ok: false, message: "Your session ended. Sign in and try again." };
  if (!canAdjustInventory(session.account.roles)) {
    return { ok: false, message: "You do not have permission to adjust stock." };
  }
  const parsed = adjustmentSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the highlighted fields.",
      errors: Object.fromEntries(
        parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
      ),
    };
  }
  const adjustment: InventoryAdjustmentWrite = parsed.data;
  try {
    const response = await adjustInventoryStock(
      session.accessToken,
      parsedStockItemId.data,
      adjustment,
    );
    if (!response.ok) {
      const problem = await readProblem(response);
      return {
        ok: false,
        message:
          response.status === 409
            ? "This adjustment would make available stock negative."
            : problemMessage(problem, "The stock adjustment could not be recorded."),
        errors: fieldErrors(problem),
      };
    }
    revalidatePath("/staff/inventory");
    return { ok: true, message: "Stock adjustment recorded. Inventory was refreshed." };
  } catch {
    return { ok: false, message: "The inventory service is unavailable. Try again shortly." };
  }
}
