import "server-only";

// Cookie custody, CSRF, and serialised refresh land here (Feature Structure.md §2, ADR-0036).

/**
 * The session cookie's name — owned here since lib/session is the eventual
 * custodian, even though issuing it for real is later-sprint scope.
 * proxy.ts checks only for this cookie's *presence* (routing, not
 * authorisation — Security.md §13, threat T9); it never reads or verifies
 * its value, and never calls an API to do so.
 */
export const SESSION_COOKIE_NAME = "ecp_session";

/**
 * Provisional no-op seam so lib/api/headers.ts has a real function to call
 * with the real shape. Real session/cookie custody is a later sprint's
 * scope — these intentionally always return null until then.
 */
export function getAccessToken(): Promise<string | null> {
  return Promise.resolve(null);
}

export function getCsrfToken(): Promise<string | null> {
  return Promise.resolve(null);
}
