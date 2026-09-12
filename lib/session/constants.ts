// Cookie names only — deliberately NOT behind `server-only`, since the
// non-HttpOnly `ecp_csrf` cookie's name is also needed by client components
// that mirror it into a hidden form field (Frontend Architecture.md §4.3).
// Everything else in lib/session stays server-only.

export const SESSION_COOKIE_NAME = "ecp_session";
export const CSRF_COOKIE_NAME = "ecp_csrf";
