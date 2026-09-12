import "server-only";

import { randomBytes, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed double-submit (Frontend Architecture.md §4.3): a random token in
 * the non-HttpOnly `ecp_csrf` cookie, mirrored back by the client (a header
 * on `fetch`, a hidden field on a form-bound Server Action) and compared
 * server-side. The doc specifies the double-submit *mechanism* but not a
 * signing algorithm — HMAC-SHA256 over a server-only secret is this
 * sprint's implementation decision, so a same-site subdomain that can set a
 * cookie still can't forge one that verifies (`Security.md` §13, `T3`).
 */
function getCsrfSecret(): string {
  const secret = process.env.CSRF_SECRET;
  if (!secret) {
    throw new Error("CSRF_SECRET is not set. See .env.example.");
  }
  return secret;
}

function sign(token: string): string {
  return createHmac("sha256", getCsrfSecret()).update(token).digest("base64url");
}

export function generateCsrfToken(): string {
  return randomBytes(32).toString("base64url");
}

/** The cookie stores `token.signature` — the client echoes this whole value back. */
export function signCsrfToken(token: string): string {
  return `${token}.${sign(token)}`;
}

function constantTimeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Verifies a submitted CSRF value against the signed cookie value: the two
 * must match exactly (double-submit) and the cookie's own signature must be
 * valid (defends against a caller who can set a cookie but doesn't know
 * `CSRF_SECRET`).
 */
export function verifyCsrfToken(cookieValue: string, submittedValue: string): boolean {
  if (!constantTimeEquals(cookieValue, submittedValue)) return false;

  const separatorIndex = cookieValue.lastIndexOf(".");
  if (separatorIndex === -1) return false;
  const token = cookieValue.slice(0, separatorIndex);
  const signature = cookieValue.slice(separatorIndex + 1);
  if (!token || !signature) return false;

  return constantTimeEquals(signature, sign(token));
}
