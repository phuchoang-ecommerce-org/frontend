"use server";

import { z } from "zod";

import { apiMutate } from "@/lib/api";
import { createSession, destroySession, getRefreshToken, requireCsrf } from "@/lib/session";

import { RegistrationRequestSchema } from "../schema/registration";
import {
  EmailVerificationRequestSchema,
  VerificationResendRequestSchema,
} from "../schema/verification";
import {
  CredentialsRequestSchema,
  SessionSchema,
  AccountSchema,
  type Session,
  type PublicSession,
  type Account,
} from "../schema/session";
import { ProfileUpdateRequestSchema } from "../schema/profile";
import {
  PasswordChangeRequestSchema,
  PasswordResetRequestSchema,
  PasswordResetSchema,
} from "../schema/security";
import { CustomerAddressSchema, CustomerAddressWriteSchema, type CustomerAddress } from "../schema/address";
import { toActionResult, type ActionResult } from "./error-mapping";

/**
 * An operator session receives the stricter cookie posture for its whole
 * lifetime. The role list comes from the validated `POST /sessions` response;
 * it is not a browser-supplied authorization claim.
 *
 * IH-1-04 ratifies this as the practical interpretation of the route-group
 * requirement: a `/`-scoped cookie has one SameSite attribute, so it cannot
 * vary per request between storefront and `(admin)` routes.
 */
const OPERATOR_ROLES = new Set(["STAFF", "WAREHOUSE_OPERATOR", "CUSTOMER_SUPPORT", "ADMINISTRATOR"]);

function isOperatorSession(account: Account): boolean {
  return account.roles.some((role) => OPERATOR_ROLES.has(role));
}

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
    }, { admin: isOperatorSession(session.account) });
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

/**
 * requestPasswordReset — POST /password-reset-requests (202, no body).
 * Anonymous (`security: []`) — no CSRF, same as registerAccount. Non-disclosive
 * by design (`BR-CUS-04`): a well-formed request always returns `{ok:true}`,
 * whether or not the address is registered.
 */
export async function requestPasswordReset(input: unknown): Promise<ActionResult> {
  const parsed = PasswordResetRequestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };

  try {
    await apiMutate(
      { method: "POST", path: "/password-reset-requests", body: parsed.data, cache: "no-store" },
      z.void(),
    );
    return { ok: true };
  } catch (err) {
    return toActionResult(err);
  }
}

/**
 * completePasswordReset — POST /password-resets (204, no body). Anonymous, no
 * CSRF. Failure (expired/used/unknown token, all `404`) stays on the generic
 * non-disclosive copy in error-mapping.ts — the contract doesn't emit a code
 * that distinguishes those causes, so the UI can't either.
 */
export async function completePasswordReset(input: unknown): Promise<ActionResult> {
  const parsed = PasswordResetSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };

  try {
    await apiMutate(
      { method: "POST", path: "/password-resets", body: parsed.data, cache: "no-store" },
      z.void(),
    );
    return { ok: true };
  } catch (err) {
    return toActionResult(err);
  }
}

/**
 * changeOwnPassword — PUT /accounts/me/password (204, no body). Requires
 * current-password re-confirmation; ends the caller's other sessions by
 * default (`BR-CUS-03`).
 */
export async function changeOwnPassword(input: unknown): Promise<ActionResult> {
  const { csrfToken, ...rest } = asRecord(input);
  const parsed = PasswordChangeRequestSchema.safeParse(rest);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };

  try {
    await requireCsrf(csrfToken);
    await apiMutate(
      { method: "PUT", path: "/accounts/me/password", body: parsed.data, cache: "no-store" },
      z.void(),
    );
    return { ok: true };
  } catch (err) {
    return toActionResult(err);
  }
}

/** endAllOwnSessions — DELETE /sessions (204, no body). Server-side invalidation of every session and refresh token (`ADR-0025` §4). */
export async function endAllOwnSessions(input?: unknown): Promise<ActionResult> {
  const { csrfToken } = asRecord(input);
  try {
    await requireCsrf(csrfToken);
  } catch (err) {
    return toActionResult(err);
  }

  try {
    await apiMutate({ method: "DELETE", path: "/sessions", cache: "no-store" }, z.void());
    return { ok: true };
  } catch (err) {
    return toActionResult(err);
  }
}

/**
 * updateOwnProfile — PATCH /accounts/me (200, body Account). Submitting
 * `email` does not change `email` directly: it populates `pendingEmail` and
 * starts a verification cycle (`UC-CUS-08` A2) — the caller renders
 * `pendingEmail` distinctly rather than treating the response's `email` as
 * already updated.
 */
export async function updateOwnProfile(input: unknown): Promise<ActionResult<Account>> {
  const { csrfToken, ...rest } = asRecord(input);
  const parsed = ProfileUpdateRequestSchema.safeParse(rest);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };

  try {
    await requireCsrf(csrfToken);
    const account = await apiMutate(
      { method: "PATCH", path: "/accounts/me", body: parsed.data, cache: "no-store" },
      AccountSchema,
    );
    return { ok: true, data: account };
  } catch (err) {
    return toActionResult<Account>(err);
  }
}

/** addOwnAddress — POST /accounts/me/addresses (201, body CustomerAddress). */
export async function addOwnAddress(input: unknown): Promise<ActionResult<CustomerAddress>> {
  const { csrfToken, ...rest } = asRecord(input);
  const parsed = CustomerAddressWriteSchema.safeParse(rest);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };

  try {
    await requireCsrf(csrfToken);
    const address = await apiMutate(
      { method: "POST", path: "/accounts/me/addresses", body: parsed.data, cache: "no-store" },
      CustomerAddressSchema,
    );
    return { ok: true, data: address };
  } catch (err) {
    return toActionResult<CustomerAddress>(err);
  }
}

/**
 * replaceOwnAddress — PUT /accounts/me/addresses/{addressId} (200, body
 * CustomerAddress). Whole replacement, idempotent. An address belonging to
 * another customer is `404`, never `403` (Integration Contract §2.1).
 */
export async function replaceOwnAddress(
  addressId: string,
  input: unknown,
): Promise<ActionResult<CustomerAddress>> {
  const { csrfToken, ...rest } = asRecord(input);
  const parsed = CustomerAddressWriteSchema.safeParse(rest);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };

  try {
    await requireCsrf(csrfToken);
    const address = await apiMutate(
      {
        method: "PUT",
        path: "/accounts/me/addresses/{addressId}",
        pathParams: { addressId },
        body: parsed.data,
        cache: "no-store",
      },
      CustomerAddressSchema,
    );
    return { ok: true, data: address };
  } catch (err) {
    return toActionResult<CustomerAddress>(err);
  }
}

/**
 * removeOwnAddress — DELETE /accounts/me/addresses/{addressId} (204,
 * idempotent — an address already gone is still `204`, not `404`, per
 * Integration Contract §2.1).
 */
export async function removeOwnAddress(addressId: string, input?: unknown): Promise<ActionResult> {
  const { csrfToken } = asRecord(input);
  try {
    await requireCsrf(csrfToken);
  } catch (err) {
    return toActionResult(err);
  }

  try {
    await apiMutate(
      { method: "DELETE", path: "/accounts/me/addresses/{addressId}", pathParams: { addressId }, cache: "no-store" },
      z.void(),
    );
    return { ok: true };
  } catch (err) {
    return toActionResult(err);
  }
}
