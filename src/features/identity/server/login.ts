"use server";

import { cookies } from "next/headers";
import { requestSession, type BackendSession } from "@/lib/api/identity";
import { createSession } from "@/lib/session";
import { checkActionOrigin } from "@/lib/session/csrf";
import type { FormResult } from "../types";

export async function signInWithCredentials(
  email: string,
  password: string,
): Promise<FormResult> {
  if (!(await checkActionOrigin())) {
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
    const guestCartId = (await cookies()).get("ecp_guest_cart")?.value;
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

    const session = (await response.json()) as BackendSession;
    if (!session.accessToken || !session.refreshToken || !session.account?.id) {
      return {
        ok: false,
        message: "Sign-in is unavailable right now. Try again shortly.",
      };
    }
    await createSession(session);
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
}): Promise<FormResult> {
  return signInWithCredentials(values.email, values.password);
}
