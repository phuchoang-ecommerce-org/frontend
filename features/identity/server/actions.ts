"use server";

import { z } from "zod";

import { apiMutate } from "@/lib/api";

import { RegistrationRequestSchema } from "../schema/registration";
import {
  EmailVerificationRequestSchema,
  VerificationResendRequestSchema,
} from "../schema/verification";
import { CredentialsRequestSchema, SessionSchema, type Session } from "../schema/session";
import { toActionResult, type ActionResult } from "./error-mapping";

function fieldErrorsFromZod(error: z.ZodError): Record<string, string> {
  return Object.fromEntries(
    error.issues.map((issue) => [issue.path.join(".") || "_form", issue.message]),
  );
}

/** registerAccount — POST /accounts (202, no body; non-disclosive re: duplicate email). */
export async function registerAccount(input: unknown): Promise<ActionResult> {
  const parsed = RegistrationRequestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };

  try {
    await apiMutate({ method: "POST", path: "/accounts", body: parsed.data, cache: "no-store" }, z.void());
    return { ok: true };
  } catch (err) {
    return toActionResult(err);
  }
}

/** verifyEmailAddress — POST /account-verifications (204, no body). */
export async function verifyEmailAddress(input: unknown): Promise<ActionResult> {
  const parsed = EmailVerificationRequestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };

  try {
    await apiMutate(
      { method: "POST", path: "/account-verifications", body: parsed.data, cache: "no-store" },
      z.void(),
    );
    return { ok: true };
  } catch (err) {
    return toActionResult(err);
  }
}

/** resendEmailVerification — POST /account-verification-requests (202, no body; non-disclosive). */
export async function resendEmailVerification(input: unknown): Promise<ActionResult> {
  const parsed = VerificationResendRequestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };

  try {
    await apiMutate(
      { method: "POST", path: "/account-verification-requests", body: parsed.data, cache: "no-store" },
      z.void(),
    );
    return { ok: true };
  } catch (err) {
    return toActionResult(err);
  }
}

/**
 * logIn — POST /sessions (201, body Session). Failure is non-disclosive
 * (bad email vs bad password are indistinguishable, `errors: []`) — see
 * error-mapping.ts. lib/session's token/CSRF custody is a no-op this sprint
 * (Sprint 4's EN-FE-API-2), so a successful call here does not yet leave the
 * browser holding a real cookie.
 */
export async function logIn(input: unknown): Promise<ActionResult<Session>> {
  const parsed = CredentialsRequestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };

  try {
    const session = await apiMutate(
      { method: "POST", path: "/sessions", body: parsed.data, cache: "no-store" },
      SessionSchema,
    );
    return { ok: true, data: session };
  } catch (err) {
    return toActionResult<Session>(err);
  }
}

/** logOut — DELETE /sessions/current (204, idempotent — already-ended session is still 204). */
export async function logOut(): Promise<ActionResult> {
  try {
    await apiMutate({ method: "DELETE", path: "/sessions/current", cache: "no-store" }, z.void());
    return { ok: true };
  } catch (err) {
    return toActionResult(err);
  }
}
