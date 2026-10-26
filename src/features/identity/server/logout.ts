"use server";

import { endSession } from "@/lib/api/identity";
import { clearSession } from "@/lib/session";
import { checkActionOrigin } from "./login";

export async function logoutAction(): Promise<void> {
  if (!(await checkActionOrigin())) return;
  const session = await clearSession();
  if (session) {
    try {
      await endSession(session.refreshToken);
    } catch {
      // The local session is already gone; the backend token expires independently.
    }
  }
}
