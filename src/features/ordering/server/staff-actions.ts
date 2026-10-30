"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { advanceOrderStatus } from "@/lib/api/ordering";
import { problemMessage, readProblem } from "@/lib/api/backend";
import { createShipment, type ShipmentWrite } from "@/lib/api/shipping";
import { getSession } from "@/lib/session";
import { canManageOrders } from "@/lib/session/roles";
import { checkActionCsrf } from "@/lib/session/csrf";

export type StaffOrderActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string; errors?: Record<string, string> };

const id = z.string().uuid("Invalid order reference.");
const transition = z.object({
  orderId: id,
  status: z.string().trim().min(1, "Choose a status."),
  reason: z.string().trim().max(500).optional(),
});
const shipment = z.object({
  orderId: id,
  carrier: z.string().trim().min(1).optional(),
  carrierOverrideReason: z.string().trim().min(1, "Explain the carrier override.").optional(),
  lineIds: z.array(z.string().uuid("Invalid order line.")).min(1).optional(),
}).superRefine((value, context) => {
  if (value.carrier && !value.carrierOverrideReason) {
    context.addIssue({ code: "custom", path: ["carrierOverrideReason"], message: "Explain the carrier override." });
  }
});

async function access(csrfToken: string): Promise<string | StaffOrderActionResult> {
  if (!(await checkActionCsrf(csrfToken))) return { ok: false, message: "Reload the page and try again." };
  const session = await getSession();
  if (!session) return { ok: false, message: "Your session ended. Sign in and try again." };
  if (!canManageOrders(session.account.roles)) return { ok: false, message: "You do not have permission to process orders." };
  return session.accessToken;
}

function validation(error: z.ZodError): StaffOrderActionResult {
  return { ok: false, message: "Check the highlighted fields.", errors: Object.fromEntries(error.issues.map((issue) => [String(issue.path[0]), issue.message])) };
}

async function failure(response: Response, fallback: string): Promise<StaffOrderActionResult> {
  const problem = await readProblem(response);
  return { ok: false, message: problem.code === "ECP-ORD-4091" ? "This order changed before your update. Reloaded state is shown below." : problemMessage(problem, fallback) };
}

function revalidateOrderViews(orderId: string): void {
  revalidatePath("/staff/orders");
  revalidatePath(`/staff/orders/${orderId}`);
  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath(`/account/orders/${orderId}/tracking`);
}

export async function advanceOrderStatusAction(value: unknown, csrfToken: string): Promise<StaffOrderActionResult> {
  const parsed = transition.safeParse(value);
  if (!parsed.success) return validation(parsed.error);
  const token = await access(csrfToken);
  if (typeof token !== "string") return token;
  try {
    const response = await advanceOrderStatus(token, parsed.data.orderId, parsed.data.status, parsed.data.reason);
    if (!response.ok) {
      revalidateOrderViews(parsed.data.orderId);
      return failure(response, "The order status could not be updated.");
    }
    revalidateOrderViews(parsed.data.orderId);
    return { ok: true, message: "Order status updated." };
  } catch {
    return { ok: false, message: "The order service is unavailable. Try again shortly." };
  }
}

export async function createShipmentAction(value: unknown, csrfToken: string): Promise<StaffOrderActionResult> {
  const parsed = shipment.safeParse(value);
  if (!parsed.success) return validation(parsed.error);
  const token = await access(csrfToken);
  if (typeof token !== "string") return token;
  try {
    const created = await createShipment(token, parsed.data as ShipmentWrite);
    revalidateOrderViews(parsed.data.orderId);
    return { ok: true, message: `Shipment created. Tracking reference: ${created.trackingReference ?? "issued by carrier"}.` };
  } catch (error) {
    if (error instanceof Response) {
      revalidateOrderViews(parsed.data.orderId);
      return failure(error, "The shipment could not be created.");
    }
    return { ok: false, message: "The shipping service is unavailable. Try again shortly." };
  }
}
