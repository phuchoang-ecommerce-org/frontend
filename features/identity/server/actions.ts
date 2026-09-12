"use server";

import { z } from "zod";

import { apiMutate } from "@/lib/api";
import { createSession, destroySession, getRefreshToken, requireCsrf } from "@/lib/session";

import { RegistrationRequestSchema } from "../schema/registration";
import {
  EmailVerificationRequestSchema,
  VerificationResendRequestSchema,
} from "../schema/verification";
import { CredentialsRequestSchema, SessionSchema, type Session, type PublicSession } from "../schema/session";
import { toActionResult, type ActionResult } from "./error-mapping";

function fieldErrorsFromZod(error: z.ZodError): Record<string, string> {
  return Object.fromEntries(
    error.issues.map((issue) => [issue.path.join(".") || "_form", issue.message]),
  );
}

function asRecord(input: unknown): Record<string, unknown> {
  return input !== null && typeof input === "object" ? (input as Record<string, unknown>) : {};
}

/** No access token ever reaches the browser (Frontend Architecture.md §4.4) — a positive field selection, not a destructure-and-discard, so nothing new on Session silently leaks through later. */
function toPublicSession(session: Session): PublicSession {
  const publicSession: PublicSession = {
    account: session.account,
    expiresIn: session.expiresIn,
  };
  if (session.restricted !== undefined) publicSession.restricted = session.restricted;
  if (session.cartMerge !== undefined) publicSession.cartMerge = session.cartMerge;
  return publicSession;
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
 * error-mapping.ts. `input` may carry a sibling `csrfToken` field (mirrored
 * from the non-HttpOnly ecp_csrf cookie by the calling form) verified
 * before the request is even sent; it's stripped out before parsing against
 * CredentialsRequestSchema so it never reaches the backend's request body.
 * On success, establishes real cookie custody (EN-FE-API-2) and strips the
 * tokens out of what's returned to client code — no access token ever
 * reaches the browser (Frontend Architecture.md §4.4).
 */
export async function logIn(input: unknown): Promise<ActionResult<PublicSession>> {
  const { csrfToken, ...rest } = asRecord(input);
  const parsed = CredentialsRequestSchema.safeParse(rest);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };

  try {
    await requireCsrf(csrfToken);
    const session = await apiMutate(
      { method: "POST", path: "/sessions", body: parsed.data, cache: "no-store" },
      SessionSchema,
    );
    await createSession({
      accessToken: session.accessToken,
      expiresIn: session.expiresIn,
      account: session.account,
      ...(session.refreshToken !== undefined ? { refreshToken: session.refreshToken } : {}),
    });
    return { ok: true, data: toPublicSession(session) };
  } catch (err) {
    return toActionResult<PublicSession>(err);
  }
}

/**
 * logOut — DELETE /sessions/current (204, idempotent — already-ended
 * session is still 204). `input` may carry a `csrfToken` field, verified
 * first. Sends the current session's refresh token in the body (the
 * Sprint 03 drift fix's `LogoutRequest.refreshToken` — its absence is
 * treated as "already ended," never an error, but sending it revokes the
 * *specific* session rather than relying on that fallback). The cookie is
 * cleared and the store record destroyed regardless of whether the
 * upstream call itself succeeds — "both halves, or it is not a logout."
 */
export async function logOut(input?: unknown): Promise<ActionResult> {
  const { csrfToken } = asRecord(input);
  try {
    await requireCsrf(csrfToken);
  } catch (err) {
    // A CSRF failure means this request is not provably the account
    // holder's own — never destroy their session as a side effect of it,
    // or a forged cross-site request becomes a way to log someone out.
    return toActionResult(err);
  }

  try {
    const refreshToken = await getRefreshToken();
    await apiMutate(
      {
        method: "DELETE",
        path: "/sessions/current",
        ...(refreshToken ? { body: { refreshToken } } : {}),
        cache: "no-store",
      },
      z.void(),
    );
    return { ok: true };
  } catch (err) {
    return toActionResult(err);
  } finally {
    await destroySession();
  }
}
