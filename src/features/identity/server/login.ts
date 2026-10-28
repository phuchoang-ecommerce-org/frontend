"use server";

import { cookies } from "next/headers";
import { parseBackendSession, requestSession } from "@/lib/api/identity";
import { createSession } from "@/lib/session";
import { checkActionCsrf } from "@/lib/session/csrf";
import { GUEST_CART_COOKIE } from "@/lib/session/guest-cart";
import type { FormResult } from "../types";

export async function signInWithCredentials(
  email: string,
  password: string,
  csrfToken: string,
): Promise<FormResult> {
  if (!(await checkActionCsrf(csrfToken))) {
    return {
      ok: false,
      message: "Sign-in request could not be verified. Reload and try again.",
    };
  }
  if (!email.trim() || !password) {
    return { ok: false, message: "Enter your email and password." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return {
      ok: false,
      message: "Enter a valid email address.",
      errors: { email: "Enter a valid email address." },
    };
  }

  try {
    const cookieStore = await cookies();
    const guestCartId = cookieStore.get(GUEST_CART_COOKIE)?.value;
    const response = await requestSession(email.trim(), password, guestCartId);
    if (response.status === 429) {
      const seconds = Number(response.headers.get("retry-after"));
      return {
        ok: false,
        message:
          Number.isFinite(seconds) && seconds > 0
            ? `Too many sign-in attempts. Try again in ${seconds} seconds.`
            : "Too many sign-in attempts. Please wait and try again.",
      };
    }
    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        message:
          "We couldn't sign you in. Check your email and password, then try again.",
      };
    }
    if (!response.ok) {
      return {
        ok: false,
        message: "Sign-in is unavailable right now. Try again shortly.",
      };
    }

    const session = parseBackendSession(await response.json());
    await createSession(session);
    if (guestCartId && session.cartMerge?.merged) {
      cookieStore.delete(GUEST_CART_COOKIE);
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      message: "Could not reach the sign-in service. Try again shortly.",
    };
  }
}

export async function loginAction(values: {
  email: string;
  password: string;
}, csrfToken: string): Promise<FormResult> {
  return signInWithCredentials(values.email, values.password, csrfToken);
}
