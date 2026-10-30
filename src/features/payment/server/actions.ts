"use server";

import { z } from "zod";
import { initiatePayment } from "@/lib/api/payment";
import { problemMessage, readProblem } from "@/lib/api/backend";
import { getSession, paymentAttempt } from "@/lib/session";
import { checkActionCsrf } from "@/lib/session/csrf";

export type InitiatePaymentActionResult =
  | { ok: true; orderId: string; redirectUrl?: string }
  | { ok: false; message: string };

const id = z.string().min(1);
const method = z.string().min(1).max(80);

function approvedProviderRedirect(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const allowed = (process.env.ECP_PAYMENT_PROVIDER_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  try {
    const url = new URL(value);
    return allowed.includes(url.origin) ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

/**
 * A write happens only after placement returned a customer-owned order ID. Any
 * ambiguous response deliberately becomes a processing read; it never retries
 * the provider write from the browser.
 */
export async function initiatePaymentAction(
  orderId: string,
  selectedMethod: string,
  csrfToken: string,
): Promise<InitiatePaymentActionResult> {
  if (!id.safeParse(orderId).success || !method.safeParse(selectedMethod).success)
    return { ok: false, message: "The payment request is invalid." };
  if (!(await checkActionCsrf(csrfToken)))
    return { ok: false, message: "Reload the page and try again." };

  const session = await getSession();
  if (!session || session.restricted || !session.account.roles.includes("CUSTOMER"))
    return { ok: false, message: "Your session ended. Sign in and try again." };
  const idempotencyKey = await paymentAttempt(orderId, selectedMethod);
  if (!idempotencyKey)
    return { ok: false, message: "Your session ended. Sign in and try again." };

  try {
    const { result } = await initiatePayment(
      session.accessToken,
      { orderId, method: selectedMethod },
      idempotencyKey,
    );
    const redirectUrl = approvedProviderRedirect(result.redirectUrl);
    return redirectUrl ? { ok: true, orderId, redirectUrl } : { ok: true, orderId };
  } catch (error) {
    if (!(error instanceof Response)) return { ok: true, orderId };
    if ([202, 404, 409, 503].includes(error.status)) return { ok: true, orderId };
    const problem = await readProblem(error);
    if (problem.status >= 500) return { ok: true, orderId };
    return {
      ok: false,
      message: problemMessage(problem, "We could not start payment."),
    };
  }
}
