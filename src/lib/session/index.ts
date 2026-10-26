import "server-only";

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { renewSession, type BackendSession } from "@/lib/api/identity";

const COOKIE_NAME = "ecp_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

type StoredSession = BackendSession & { expiresAt: number };
type SessionState = {
  sessions: Map<string, StoredSession>;
  renewals: Map<string, Promise<StoredSession | null>>;
};

// Shared by route and action modules in the local Next.js server process.
const runtime = globalThis as typeof globalThis & {
  __ecpSessionState?: SessionState;
};
const state = (runtime.__ecpSessionState ??= {
  sessions: new Map(),
  renewals: new Map(),
});

function storeValue(session: BackendSession): StoredSession {
  return { ...session, expiresAt: Date.now() + session.expiresIn * 1000 };
}

export async function createSession(session: BackendSession): Promise<void> {
  const id = randomBytes(32).toString("hex");
  state.sessions.set(id, storeValue(session));
  (await cookies()).set(COOKIE_NAME, id, {
    httpOnly: true,
    secure: true,
    sameSite: session.account.roles.some((role) => role !== "CUSTOMER")
      ? "strict"
      : "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function getSession(): Promise<StoredSession | null> {
  const id = (await cookies()).get(COOKIE_NAME)?.value;
  if (!id) return null;
  const stored = state.sessions.get(id);
  if (!stored) return null;
  if (stored.expiresAt > Date.now() + 15_000) return stored;

  let renewal = state.renewals.get(id);
  if (!renewal) {
    renewal = (async () => {
      try {
        const response = await renewSession(stored.refreshToken);
        if (!response.ok) return null;
        const next = storeValue((await response.json()) as BackendSession);
        state.sessions.set(id, next);
        return next;
      } catch {
        return null;
      } finally {
        state.renewals.delete(id);
      }
    })();
    state.renewals.set(id, renewal);
  }
  const next = await renewal;
  if (!next) state.sessions.delete(id);
  return next;
}

export async function clearSession(): Promise<StoredSession | null> {
  const cookieStore = await cookies();
  const id = cookieStore.get(COOKIE_NAME)?.value;
  const session = id ? (state.sessions.get(id) ?? null) : null;
  if (id) state.sessions.delete(id);
  cookieStore.delete(COOKIE_NAME);
  return session;
}
