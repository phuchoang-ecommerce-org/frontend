"use server";

import { backendRequest, fieldErrors, readProblem } from "@/lib/api/backend";
import { checkActionOrigin } from "@/lib/session/csrf";
import type { FormResult } from "../types";

const neutralEmailMessage = "If this email has an account, we will send a link.";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function submitGuestRequest(
  path: string,
  body: object,
  successMessage: string,
  failureMessage: string,
): Promise<FormResult> {
  if (!(await checkActionOrigin()))
    return { ok: false, message: "Reload the page and try again." };
  try {
    const response = await backendRequest(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (response.ok) return { ok: true, message: successMessage };
    const problem = await readProblem(response);
    return {
      ok: false,
      message: response.status === 429 ? "Too many requests. Wait and try again." : problem.detail || failureMessage,
      errors: fieldErrors(problem),
    };
  } catch {
    return { ok: false, message: failureMessage };
  }
}

export async function registerAction(values: {
  name: string;
  email: string;
  password: string;
}): Promise<FormResult> {
  const email = values.email.trim();
  if (!values.name.trim() || !emailPattern.test(email) || !values.password)
    return { ok: false, message: "Check your name, email, and password.", errors: {
      ...(!values.name.trim() ? { name: "Enter your name." } : {}),
      ...(!emailPattern.test(email) ? { email: "Enter a valid email address." } : {}),
      ...(!values.password ? { password: "Enter a password." } : {}),
    } };
  const result = await submitGuestRequest(
    "/accounts",
    { displayName: values.name.trim(), email, password: values.password },
    "Account created. Check your email for a verification link.",
    "Your account could not be created. Try again.",
  );
  if (!result.ok && result.errors?.displayName)
    return { ...result, errors: { ...result.errors, name: result.errors.displayName } };
  return result;
}

export async function requestPasswordResetAction(values: { email: string }): Promise<FormResult> {
  const email = values.email.trim();
  if (!emailPattern.test(email)) return { ok: false, message: "Enter a valid email address.", errors: { email: "Enter a valid email address." } };
  return submitGuestRequest("/password-reset-requests", { email }, neutralEmailMessage, "The request could not be completed. Try again.");
}

export async function completePasswordResetAction(values: { token: string; newPassword: string }): Promise<FormResult> {
  if (!values.token || !values.newPassword)
    return { ok: false, message: "Enter the new password from your reset link.", errors: { newPassword: "Enter a new password." } };
  return submitGuestRequest("/password-resets", values, "Password updated. Go to sign-in.", "The reset link is invalid or expired. Request a new link.");
}

export async function verifyEmailAction(token: string): Promise<FormResult> {
  if (!token) return { ok: false, message: "Open the link from your verification email." };
  return submitGuestRequest("/account-verifications", { token }, "Email verified. You can sign in now.", "The verification link is invalid or expired. Request a new link.");
}

export async function resendVerificationAction(values: { email: string }): Promise<FormResult> {
  const email = values.email.trim();
  if (!emailPattern.test(email)) return { ok: false, message: "Enter a valid email address.", errors: { email: "Enter a valid email address." } };
  return submitGuestRequest("/account-verification-requests", { email }, neutralEmailMessage, "The request could not be completed. Try again.");
}
