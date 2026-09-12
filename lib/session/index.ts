import "server-only";

import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";

import { generateCsrfToken, signCsrfToken, verifyCsrfToken } from "./csrf";
import { renewSession as callRenewSession } from "./renew";
import { sessionStore, type SessionRecord, type SessionStore } from "./store";
import { SESSION_COOKIE_NAME, CSRF_COOKIE_NAME } from "./constants";

export { SESSION_COOKIE_NAME, CSRF_COOKIE_NAME };

// Held only across the renewal call itself, and strictly shorter than the
// fetch client's own request timeout (lib/api/config.ts's REQUEST_TIMEOUT_MS
// — lib/session may not depend on lib/api, eslint boundaries I-7, so this
// value is kept in sync by hand rather than imported) — a lock that
// outlives its holder converts a refresh race into a hang (Frontend
// Architecture.md §4.2).
const REFRESH_LOCK_TIMEOUT_MS = 8_000;

export interface SessionInput {
  accessToken: string;
  refreshToken?: string;
  /** Seconds, per the API contract's `expiresIn`. */
  expiresIn: number;
  account: unknown;
}

export interface CookieOptions {
  /** SameSite=Strict under `(admin)`, Lax elsewhere (Frontend Architecture.md §4.1). */
  admin?: boolean;
}

function sameSiteFor({ admin }: CookieOptions): "strict" | "lax" {
  return admin ? "strict" : "lax";
}

/**
 * Establishes real cookie custody after a successful `POST /sessions`.
 * `ecp_session` is opaque and never a JWT — it's a key into the server-side
 * store, which is where the actual tokens live. `ecp_csrf` is deliberately
 * non-HttpOnly so client JS can mirror it into a header or hidden field.
 */
export async function createSession(session: SessionInput, options: CookieOptions = {}): Promise<void> {
  const sessionId = randomUUID();
  const csrfToken = generateCsrfToken();
  const signedCsrf = signCsrfToken(csrfToken);

  const record: SessionRecord = {
    accessToken: session.accessToken,
    expiresAt: Date.now() + session.expiresIn * 1_000,
    csrfToken: signedCsrf,
    account: session.account,
    ...(session.refreshToken !== undefined ? { refreshToken: session.refreshToken } : {}),
  };
  sessionStore.set(sessionId, record);

  const cookieStore = await cookies();
  const sameSite = sameSiteFor(options);
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: true,
    sameSite,
    path: "/",
  });
  cookieStore.set(CSRF_COOKIE_NAME, signedCsrf, {
    httpOnly: false,
    secure: true,
    sameSite,
    path: "/",
  });
}

/**
 * Clears both cookies and invalidates the store record. Called regardless
 * of whether the upstream `DELETE /sessions/current` call itself succeeded —
 * "logout clears the cookie AND invalidates the refresh token server-side,
 * both halves or it is not a logout" (Frontend Architecture.md §4.2), but a
 * failed server-side call must never leave the browser holding a cookie it
 * can't use to retry cleanly.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (sessionId) {
    sessionStore.delete(sessionId);
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(CSRF_COOKIE_NAME);
}

/** The current session's refresh token, if any — logOut needs this to name which session to revoke. */
export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionId) return null;
  return sessionStore.get(sessionId)?.refreshToken ?? null;
}

/**
 * Serialised refresh (Frontend Architecture.md §4.2, ADR-0016 §5): only the
 * caller that finds the lock free and the token still matching
 * `rejectedToken` (or, for the proactive/expiry path, still past its
 * `expiresAt`) actually calls `renewSession`. Everyone else — having waited
 * on the same per-session lock — sees the already-updated record and
 * returns it without a second network call. `rejectedToken` is `undefined`
 * for the proactive path (getAccessToken's own expiry check); it's the
 * specific token the backend just 401'd for the reactive path
 * (lib/api/client.ts's retry-once-on-401).
 *
 * `store` is injectable for tests — the default is the shared singleton.
 */
export async function refreshSession(
  sessionId: string,
  rejectedToken?: string,
  store: SessionStore = sessionStore,
): Promise<string | null> {
  const release = await store.acquireLock(sessionId, REFRESH_LOCK_TIMEOUT_MS);
  if (!release) return null; // timed out — never hang the caller

  try {
    const current = store.get(sessionId);
    if (!current) return null;

    const stillLooksValid = Date.now() < current.expiresAt && current.accessToken !== rejectedToken;
    if (stillLooksValid) return current.accessToken;

    if (!current.refreshToken) {
      store.delete(sessionId);
      return null;
    }

    const renewed = await callRenewSession(current.refreshToken);
    if (!renewed) {
      // Reuse detected, or the refresh token was rejected outright — the
      // whole session chain is invalid (BR-CUS-03, ADR-0016 §4).
      store.delete(sessionId);
      return null;
    }

    const updated: SessionRecord = {
      ...current,
      accessToken: renewed.accessToken,
      refreshToken: renewed.refreshToken ?? current.refreshToken,
      expiresAt: Date.now() + renewed.expiresIn * 1_000,
    };
    store.set(sessionId, updated);
    return updated.accessToken;
  } finally {
    release();
  }
}

/** Proactive path: the fetch client's outbound credential attachment (lib/api/headers.ts). */
export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionId) return null;

  const record = sessionStore.get(sessionId);
  if (!record) return null;

  if (Date.now() < record.expiresAt) return record.accessToken;
  return refreshSession(sessionId);
}

/**
 * Reactive path: the backend itself rejected the token client.ts just sent
 * (`ECP-GEN-4010` on an authenticated call) even though it didn't look
 * expired locally yet (clock skew, or a revoke ecp-web hasn't observed).
 * Used only by lib/api/client.ts's single retry-after-401.
 */
export async function refreshCurrentSession(rejectedToken: string): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionId) return null;
  return refreshSession(sessionId, rejectedToken);
}

export async function getCsrfToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value ?? null;
}

/**
 * Verifies a Server Action's inbound CSRF value against the cookie —
 * double-submit, with the submitted side arriving as a hidden form field
 * mirroring `ecp_csrf` (a form-bound Server Action can't attach a custom
 * header the way `fetch` can; this is the standard adaptation, not
 * spelled out in Frontend Architecture.md §4.3 itself).
 */
export async function verifyCsrf(submitted: string | undefined): Promise<boolean> {
  if (!submitted) return false;
  const cookieValue = await getCsrfToken();
  if (!cookieValue) return false;
  return verifyCsrfToken(cookieValue, submitted);
}

/**
 * Every cookie-authenticated write composes this first (Frontend
 * Architecture.md §4.3 — "Server Actions are covered by this, not exempt
 * from it"). Thrown into the same try/catch each action already has around
 * its `apiMutate` call; error-mapping.ts maps it to a non-disclosive
 * form-level message alongside ApiProblem/ApiTransportError.
 */
export class CsrfError extends Error {
  constructor() {
    super("CSRF token missing or invalid");
    this.name = "CsrfError";
  }
}

export async function requireCsrf(submitted: unknown): Promise<void> {
  const ok = await verifyCsrf(typeof submitted === "string" ? submitted : undefined);
  if (!ok) throw new CsrfError();
}

/**
 * Mints `ecp_csrf` for an anonymous/pre-session caller if it doesn't
 * already have one — e.g. the sign-in form, which needs a CSRF token before
 * any session exists. Only `/api/csrf`'s route handler calls this; rotation
 * happens on sign-in/sign-out (via createSession/destroySession), never
 * per-request (Frontend Architecture.md §4.3).
 */
export async function mintCsrfCookieIfAbsent(): Promise<void> {
  const cookieStore = await cookies();
  if (cookieStore.get(CSRF_COOKIE_NAME)) return;
  const signed = signCsrfToken(generateCsrfToken());
  cookieStore.set(CSRF_COOKIE_NAME, signed, {
    httpOnly: false,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
}
