"use server";

import { endAllSessions, endSession } from "@/lib/api/identity";
import { clearSession, getSession } from "@/lib/session";
import { checkActionCsrf } from "@/lib/session/csrf";
import type { FormResult } from "../types";

function csrfFailure(): FormResult {
  return {
    ok: false,
    message: "Sign-out request could not be verified. Reload and try again.",
  };
}

function reportBackendInvalidationFailure(scope: "current" | "all"): void {
  // Keep tokens and session identifiers out of operational logs.
  console.error(`Backend ${scope}-session invalidation failed after local sign-out`);
}

export async function logoutAction(csrfToken: string): Promise<FormResult> {
  if (!(await checkActionCsrf(csrfToken))) return csrfFailure();
  const session = await clearSession();
  if (!session) return { ok: true };
  try {
    await endSession(session.refreshToken);
    return { ok: true };
  } catch {
    reportBackendInvalidationFailure("current");
    return {
      ok: true,
      message:
        "You have signed out on this device. The server sign-out could not be completed.",
    };
  }
}

export async function logoutAllAction(csrfToken: string): Promise<FormResult> {
  if (!(await checkActionCsrf(csrfToken))) return csrfFailure();
  const session = await getSession();
  await clearSession();
  if (!session) return { ok: true };
  try {
    await endAllSessions(session.accessToken);
    return { ok: true };
  } catch {
    reportBackendInvalidationFailure("all");
    return {
      ok: true,
      message:
        "You have signed out on this device. The server sign-out could not be completed.",
    };
  }
}
