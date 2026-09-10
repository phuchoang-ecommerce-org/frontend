import "server-only";

// Cookie custody, CSRF, and serialised refresh land here (Feature Structure.md §2, ADR-0036).

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
