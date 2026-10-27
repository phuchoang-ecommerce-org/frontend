"use server";

import { endAllSessions, endSession } from "@/lib/api/identity";
import { clearSession, getSession } from "@/lib/session";
import { checkActionCsrf } from "@/lib/session/csrf";

export async function logoutAction(csrfToken: string): Promise<void> {
  if (!(await checkActionCsrf(csrfToken))) return;
  const session = await clearSession();
  if (session) {
    try {
      await endSession(session.refreshToken);
    } catch {
      // The local session is already gone; the backend token expires independently.
    }
  }
}

export async function logoutAllAction(csrfToken: string): Promise<void> {
  if (!(await checkActionCsrf(csrfToken))) return;
  const session = await getSession();
  await clearSession();
  if (!session) return;
  try {
    await endAllSessions(session.accessToken);
  } catch {
    // Local sign-out is authoritative for the browser; backend retry is operational.
  }
}
