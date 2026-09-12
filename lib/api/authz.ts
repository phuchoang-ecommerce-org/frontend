import "server-only";

import { ApiProblem } from "./errors";

/** Authenticated, but the role does not permit this operation (Error Codes.md). */
const FORBIDDEN_CODE = "ECP-GEN-4030";

/**
 * For a Server Component section that may be authorised for some callers
 * and not others: a 403 means "the section/control is simply absent from
 * the render, page does not explain why" (US-AUD-03/FE) — this catches
 * exactly that outcome and turns it into `null`. Everything else (404,
 * transport errors, parse errors) rethrows unchanged, so existing
 * `notFound()` and `error.tsx` handling at the call site is untouched.
 */
export async function readOptionalSection<T>(fetcher: () => Promise<T>): Promise<T | null> {
  try {
    return await fetcher();
  } catch (err) {
    if (err instanceof ApiProblem && err.code === FORBIDDEN_CODE) {
      return null;
    }
    throw err;
  }
}
