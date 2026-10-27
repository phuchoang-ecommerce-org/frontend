"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createAddress,
  deleteAddress,
  replaceAddress,
  type CustomerAddressWrite,
} from "@/lib/api/addresses";
import {
  fieldErrors,
  problemMessage,
  readProblem,
} from "@/lib/api/backend";
import { getSession } from "@/lib/session";
import { checkActionCsrf } from "@/lib/session/csrf";
import type { AddressDraft, FormResult } from "../types";

const addressSchema = z.object({
  label: z.string().trim().max(80),
  recipientName: z.string().trim().min(1, "Enter the recipient name."),
  line1: z.string().trim().min(1, "Enter the street address."),
  line2: z.string().trim().max(160),
  city: z.string().trim().min(1, "Enter the city."),
  region: z.string().trim().max(100),
  postalCode: z.string().trim().min(1, "Enter the postal code."),
  countryCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, "Use a two-letter country code."),
  phone: z.string().trim().max(40),
  isDefaultShipping: z.boolean(),
  isDefaultBilling: z.boolean(),
});

function writeAddress(value: z.infer<typeof addressSchema>): CustomerAddressWrite {
  return {
    recipientName: value.recipientName,
    line1: value.line1,
    city: value.city,
    postalCode: value.postalCode,
    countryCode: value.countryCode,
    isDefaultShipping: value.isDefaultShipping,
    isDefaultBilling: value.isDefaultBilling,
    ...(value.label ? { label: value.label } : {}),
    ...(value.line2 ? { line2: value.line2 } : {}),
    ...(value.region ? { region: value.region } : {}),
    ...(value.phone ? { phone: value.phone } : {}),
  };
}

function validationFailure(
  error: z.ZodError<z.infer<typeof addressSchema>>,
): FormResult {
  const errors = Object.fromEntries(
    error.issues.map((issue) => [String(issue.path[0]), issue.message]),
  );
  return {
    ok: false,
    message: "Check the highlighted address fields.",
    errors,
  };
}

export async function saveAddressAction(
  addressId: string | null,
  values: AddressDraft,
  csrfToken: string,
): Promise<FormResult> {
  if (!(await checkActionCsrf(csrfToken))) {
    return { ok: false, message: "Reload the page and try again." };
  }
  const parsed = addressSchema.safeParse(values);
  if (!parsed.success) return validationFailure(parsed.error);
  const session = await getSession();
  if (!session) {
    return { ok: false, message: "Your session ended. Sign in and try again." };
  }
  try {
    const response = addressId
      ? await replaceAddress(
          session.accessToken,
          addressId,
          writeAddress(parsed.data),
        )
      : await createAddress(session.accessToken, writeAddress(parsed.data));
    if (!response.ok) {
      const problem = await readProblem(response);
      return {
        ok: false,
        message: problemMessage(problem, "The address could not be saved."),
        errors: fieldErrors(problem),
      };
    }
    revalidatePath("/account/addresses");
    return {
      ok: true,
      message: addressId ? "Address updated." : "Address added.",
    };
  } catch {
    return {
      ok: false,
      message: "The address service is unavailable. Try again shortly.",
    };
  }
}

export async function removeAddressAction(
  addressId: string,
  csrfToken: string,
): Promise<FormResult> {
  if (!(await checkActionCsrf(csrfToken))) {
    return { ok: false, message: "Reload the page and try again." };
  }
  const session = await getSession();
  if (!session) {
    return { ok: false, message: "Your session ended. Sign in and try again." };
  }
  try {
    const response = await deleteAddress(session.accessToken, addressId);
    if (!response.ok) {
      const problem = await readProblem(response);
      return {
        ok: false,
        message: problemMessage(problem, "The address could not be removed."),
      };
    }
    revalidatePath("/account/addresses");
    return { ok: true, message: "Address removed." };
  } catch {
    return {
      ok: false,
      message: "The address service is unavailable. Try again shortly.",
    };
  }
}
