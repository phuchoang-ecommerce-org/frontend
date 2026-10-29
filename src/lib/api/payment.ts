import "server-only";

import { z } from "zod";
import { backendRequest } from "./backend";
import { parseCheckout } from "./ordering";
import type { components } from "./types";

export type PaymentMethod = components["schemas"]["PaymentMethod"];
export type PaymentMethodSelection =
  components["schemas"]["PaymentMethodSelection"];
export type Checkout = components["schemas"]["Checkout"];

const paymentMethodSchema = z.object({
  type: z.string().min(1),
  displayName: z.string().optional(),
  eligible: z.boolean(),
  ineligibleReason: z.string().optional(),
});
type ApiPaymentMethod = z.infer<typeof paymentMethodSchema>;
type PaymentContractCompatibility = PaymentMethod extends ApiPaymentMethod ? true : never;
const paymentContractCompatibility: PaymentContractCompatibility = true;
void paymentContractCompatibility;

function bearer(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

export function parsePaymentMethods(value: unknown): PaymentMethod[] {
  return z.array(paymentMethodSchema).parse(value) as PaymentMethod[];
}

export async function listEligiblePaymentMethods(
  accessToken: string,
  orderId: string,
): Promise<PaymentMethod[]> {
  const response = await backendRequest(
    `/orders/${encodeURIComponent(orderId)}/payment-methods`,
    { headers: bearer(accessToken), cache: "no-store" },
  );
  if (!response.ok) throw response;
  return parsePaymentMethods(await response.json());
}

export async function selectCheckoutPaymentMethod(
  accessToken: string,
  checkoutId: string,
  selection: PaymentMethodSelection,
): Promise<Checkout> {
  const response = await backendRequest(
    `/checkouts/${encodeURIComponent(checkoutId)}/payment-method`,
    {
      method: "PUT",
      headers: bearer(accessToken),
      body: JSON.stringify(selection),
      cache: "no-store",
    },
  );
  if (!response.ok) throw response;
  return parseCheckout(await response.json());
}
