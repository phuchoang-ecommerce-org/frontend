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
};
