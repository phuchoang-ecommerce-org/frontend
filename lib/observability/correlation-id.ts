// Single source for the X-Correlation-Id convention (Data Fetching.md §2.1).
// No `server-only` here: proxy.ts runs outside the RSC graph server-only
// polices, and lib/api/headers.ts (which is server-only) re-exports this for
// its own callers, so both sides share one generation strategy.

export const CORRELATION_ID_HEADER = "X-Correlation-Id";

export function newCorrelationId(): string {
  return crypto.randomUUID();
}
