import "server-only";

import { ApiParseError, ApiProblem, ApiTransportError, ERROR_SCREEN_MAP } from "@/lib/api";

export interface ActionResult<T = undefined> {
  ok: boolean;
  data?: T;
  fieldErrors?: Record<string, string>;
  formError?: { message: string; retryable: boolean; correlationId?: string };
}

const GENERIC_RETRY_MESSAGE = "Something went wrong. Please try again.";

function nonDisclosiveMessageFor(code: string): { message: string; retryable: boolean } {
  const outcome = ERROR_SCREEN_MAP[code];
  switch (outcome?.kind) {
    case "sign-in-failed":
      return { message: "We couldn't sign you in with those details.", retryable: true };
    case "rate-limited":
      return { message: "Too many attempts. Please try again shortly.", retryable: true };
    default:
      return { message: GENERIC_RETRY_MESSAGE, retryable: outcome?.retryable ?? false };
  }
}

/**
 * The single place a Problem becomes something a form can render. Field-level
 * errors (RegistrationRequest/EmailVerificationRequest/etc validation
 * failures) map onto `fieldErrors` by `field`; every non-disclosive case
 * (sign-in 401, rate limits, unknown/expired verification tokens — all of
 * which carry `errors: []`) falls back to a form-level, never-field-attributed
 * message via `formError`.
 */
export function toActionResult<T>(err: unknown): ActionResult<T> {
  if (err instanceof ApiProblem) {
    if (err.problem.errors.length > 0) {
      return {
        ok: false,
        fieldErrors: Object.fromEntries(
          err.problem.errors.map((e) => [e.field, e.detail ?? e.code]),
        ),
      };
    }
    const { message, retryable } = nonDisclosiveMessageFor(err.problem.code);
    return {
      ok: false,
      formError: {
        message,
        retryable,
        ...(err.problem.correlationId ? { correlationId: err.problem.correlationId } : {}),
      },
    };
  }
  if (err instanceof ApiTransportError) {
    return { ok: false, formError: { message: GENERIC_RETRY_MESSAGE, retryable: true } };
  }
  if (err instanceof ApiParseError) {
    // A contract violation, not a user-facing outcome — surface it as a
    // genuine error rather than a designed form-error state.
    throw err;
  }
  throw err;
}
