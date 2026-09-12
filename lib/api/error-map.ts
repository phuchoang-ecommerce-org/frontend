import "server-only";

/**
 * Error-code → screen-outcome map (Data Fetching.md §9). A code listed here
 * is a *designed outcome*, not a failure — the calling screen renders it
 * directly rather than falling back to a generic error boundary.
 */
export interface ErrorScreenOutcome {
  kind: string;
  retryable: boolean;
}

export const ERROR_SCREEN_MAP: Record<string, ErrorScreenOutcome> = {
  // 409 — expected under peak load, the visible surface of the oversell
  // guarantee (ADR-0011), not a client mistake. "Sold out."
  "ECP-INV-4091": { kind: "sold-out", retryable: true },

  // 409 — promotion usage limit reached by a *concurrent* redemption
  // (Integration Contract §4.5, UC-PRM-02 E7). This is a race-condition
  // conflict on a well-formed voucher, not a field-validation failure —
  // despite surfacing at the voucher field in the UI (Data Fetching.md
  // §6.4/§9), it must not be worded as "invalid voucher code."
  "ECP-PRM-4090": { kind: "promotion-conflict", retryable: true },

  // 401 — sign-in failure (BR-CUS-04, UC-CUS-03). `errors: []` always — bad
  // email and bad password are indistinguishable by design, so this can
  // never be mapped onto a specific form field. Renders as a form-level
  // EmptyState, not a field error.
  "ECP-GEN-4010": { kind: "sign-in-failed", retryable: true },

  // 429 — registration, sign-in, and verification-resend all carry the
  // strictest rate limit and fail closed (NFR-SEC-05, ADR-0015 §5).
  "ECP-GEN-4290": { kind: "rate-limited", retryable: true },

  // TODO(identity): the OpenAPI contract's accountVerifications responses
  // list only 400/404/429 — no code distinguishes an expired token from an
  // unknown one, despite paths/identity.yaml's description promising
  // "an expired one is reported as expired." Add an entry here once the
  // backend actually emits a distinguishing code; until then, verify-email
  // failure copy must stay generic (see app/(auth)/verify-email/page.tsx).
};
