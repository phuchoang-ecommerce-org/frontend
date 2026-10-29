"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  applyCheckoutVoucher,
  initiateCheckout,
  selectCheckoutShippingOption,
  setCheckoutBillingInformation,
  setCheckoutShippingAddress,
} from "@/lib/api/ordering";
import { selectCheckoutPaymentMethod } from "@/lib/api/payment";
import { fieldErrors, problemMessage, readProblem } from "@/lib/api/backend";
import { getSession } from "@/lib/session";
import { checkActionCsrf } from "@/lib/session/csrf";

export type CheckoutActionResult =
  | { ok: true; message?: string }
  | { ok: false; message: string; errors?: Record<string, string> };

const id = z.string().min(1);
const address = z.object({
  label: z.string().trim().max(80).optional(),
  recipientName: z.string().trim().min(1, "Enter the recipient name."),
  line1: z.string().trim().min(1, "Enter the street address."),
  line2: z.string().trim().max(160).optional(),
  city: z.string().trim().min(1, "Enter the city."),
  region: z.string().trim().max(100).optional(),
  postalCode: z.string().trim().min(1, "Enter the postal code."),
  countryCode: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, "Use a two-letter country code."),
  phone: z.string().trim().max(40).optional(),
});

async function authorised(csrfToken: string): Promise<CheckoutActionResult | string> {
  if (!(await checkActionCsrf(csrfToken))) return { ok: false, message: "Reload the page and try again." };
  const session = await getSession();
  if (!session) return { ok: false, message: "Your session ended. Sign in and try again." };
  if (session.restricted || session.account.verificationStatus !== "VERIFIED" || !session.account.roles.includes("CUSTOMER")) {
    return { ok: false, message: "Verify your customer account before checking out." };
  }
  return session.accessToken;
}

function invalid(error: z.ZodError): CheckoutActionResult {
  return {
    ok: false,
    message: "Check the highlighted fields.",
    errors: Object.fromEntries(error.issues.map((issue) => [String(issue.path[0]), issue.message])),
  };
}

function definedAddress(value: z.infer<typeof address>) {
  return {
    recipientName: value.recipientName,
    line1: value.line1,
    city: value.city,
    postalCode: value.postalCode,
    countryCode: value.countryCode,
    ...(value.label ? { label: value.label } : {}),
    ...(value.line2 ? { line2: value.line2 } : {}),
    ...(value.region ? { region: value.region } : {}),
    ...(value.phone ? { phone: value.phone } : {}),
  };
}

async function result(action: () => Promise<unknown>): Promise<CheckoutActionResult> {
  try {
    await action();
    revalidatePath("/checkout");
    return { ok: true };
  } catch (error) {
    if (error instanceof Response) {
      const problem = await readProblem(error);
      return { ok: false, message: problemMessage(problem, "Checkout could not be updated."), errors: fieldErrors(problem) };
    }
    return { ok: false, message: "Checkout could not be updated. Try again shortly." };
  }
}

export async function startCheckoutAction(csrfToken: string): Promise<CheckoutActionResult> {
  const accessToken = await authorised(csrfToken);
  return typeof accessToken === "string" ? result(() => initiateCheckout(accessToken)) : accessToken;
}

export async function chooseShippingAddressAction(value: unknown, csrfToken: string): Promise<CheckoutActionResult> {
  const parsed = z.object({ checkoutId: id, addressId: id.optional(), address: address.optional(), saveToAddressBook: z.boolean() }).refine((item) => Boolean(item.addressId || item.address), "Choose or enter an address.").safeParse(value);
  if (!parsed.success) return invalid(parsed.error);
  const accessToken = await authorised(csrfToken);
  return typeof accessToken === "string" ? result(() => setCheckoutShippingAddress(accessToken, parsed.data.checkoutId, {
    ...(parsed.data.addressId ? { addressId: parsed.data.addressId } : {}),
    ...(parsed.data.address ? { address: definedAddress(parsed.data.address) } : {}),
    saveToAddressBook: parsed.data.saveToAddressBook,
  })) : accessToken;
}

export async function chooseBillingInformationAction(value: unknown, csrfToken: string): Promise<CheckoutActionResult> {
  const parsed = z.object({ checkoutId: id, sameAsShipping: z.boolean(), addressId: id.optional(), address: address.optional() }).refine((item) => item.sameAsShipping || Boolean(item.addressId || item.address), "Choose or enter a billing address.").safeParse(value);
  if (!parsed.success) return invalid(parsed.error);
  const accessToken = await authorised(csrfToken);
  return typeof accessToken === "string" ? result(() => setCheckoutBillingInformation(accessToken, parsed.data.checkoutId, {
    sameAsShipping: parsed.data.sameAsShipping,
    ...(parsed.data.addressId ? { addressId: parsed.data.addressId } : {}),
    ...(parsed.data.address ? { address: definedAddress(parsed.data.address) } : {}),
  })) : accessToken;
}

export async function chooseShippingOptionAction(checkoutId: string, shippingOptionId: string, csrfToken: string): Promise<CheckoutActionResult> {
  if (!id.safeParse(checkoutId).success || !id.safeParse(shippingOptionId).success) return { ok: false, message: "Choose a shipping option." };
  const accessToken = await authorised(csrfToken);
  return typeof accessToken === "string" ? result(() => selectCheckoutShippingOption(accessToken, checkoutId, { shippingOptionId })) : accessToken;
}

export async function choosePaymentMethodAction(checkoutId: string, method: string, csrfToken: string): Promise<CheckoutActionResult> {
  if (!id.safeParse(checkoutId).success || !id.safeParse(method).success) return { ok: false, message: "Choose a payment method." };
  const accessToken = await authorised(csrfToken);
  return typeof accessToken === "string" ? result(() => selectCheckoutPaymentMethod(accessToken, checkoutId, { method })) : accessToken;
}

export async function applyVoucherAction(checkoutId: string, code: string, csrfToken: string): Promise<CheckoutActionResult> {
  const parsed = z.object({ checkoutId: id, code: z.string().trim().min(1, "Enter a voucher code.") }).safeParse({ checkoutId, code });
  if (!parsed.success) return invalid(parsed.error);
  const accessToken = await authorised(csrfToken);
  return typeof accessToken === "string" ? result(() => applyCheckoutVoucher(accessToken, parsed.data.checkoutId, { code: parsed.data.code })) : accessToken;
}
