import "server-only";

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import {
  parseBackendSession,
  renewSession,
  type BackendSession,
} from "@/lib/api/identity";
import { issueCsrfToken } from "./csrf";
import {
  newRefreshLockOwner,
  SESSION_MAX_AGE_SECONDS,
  sessionStore,
  type StoredSession,
} from "./store";

const COOKIE_NAME = "ecp_session";
const REFRESH_WINDOW_MS = 15_000;
const REFRESH_WAIT_MS = 100;
const REFRESH_WAIT_ATTEMPTS = 100;

function storeValue(session: BackendSession): StoredSession {
  return { ...session, expiresAt: Date.now() + session.expiresIn * 1000 };
}

function sameSiteFor(session: BackendSession): "lax" | "strict" {
  return session.account.roles.some((role) => role !== "CUSTOMER")
    ? "strict"
    : "lax";
}

export async function createSession(session: BackendSession): Promise<void> {
  const id = randomBytes(32).toString("hex");
  const sameSite = sameSiteFor(session);
  await sessionStore().set(id, storeValue(session));
  (await cookies()).set(COOKIE_NAME, id, {
    httpOnly: true,
    secure: true,
    sameSite,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  await issueCsrfToken(sameSite);
}

export async function getSession(): Promise<StoredSession | null> {
  const id = (await cookies()).get(COOKIE_NAME)?.value;
  if (!id) return null;
  const store = sessionStore();
  const stored = await store.get(id);
  if (!stored) return null;
  if (stored.expiresAt > Date.now() + REFRESH_WINDOW_MS) return stored;

  const owner = newRefreshLockOwner();
  if (await store.acquireRefreshLock(id, owner)) {
    try {
      const latest = await store.get(id);
      if (!latest) return null;
      if (latest.expiresAt > Date.now() + REFRESH_WINDOW_MS) return latest;
      let response: Response;
      try {
        response = await renewSession(latest.refreshToken);
      } catch {
        // Keep the stored session so a temporary identity-service outage does
        // not revoke it. Callers must not use the expired access token.
        return null;
      }
      if (!response.ok) {
        await store.delete(id);
        return null;
      }
      try {
        const next = storeValue(parseBackendSession(await response.json()));
        await store.set(id, next);
        return next;
      } catch {
        // A successful renewal must still satisfy the reviewed response
        // schema. Treat malformed token responses as a terminal session.
        await store.delete(id).catch(() => undefined);
        return null;
      }
    } catch {
      return null;
    } finally {
      await store.releaseRefreshLock(id, owner).catch(() => undefined);
    }
  }

  for (let attempt = 0; attempt < REFRESH_WAIT_ATTEMPTS; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, REFRESH_WAIT_MS));
    const next = await store.get(id);
    if (!next) return null;
    if (
      next.refreshToken !== stored.refreshToken ||
      next.expiresAt > Date.now() + REFRESH_WINDOW_MS
    ) {
      return next;
    }
  }
  return null;
}

export async function clearSession(): Promise<StoredSession | null> {
  const cookieStore = await cookies();
  const id = cookieStore.get(COOKIE_NAME)?.value;
  const store = sessionStore();
  const session = id ? await store.get(id) : null;
  if (id) await store.delete(id);
  cookieStore.delete(COOKIE_NAME);
  cookieStore.delete("ecp_csrf");
  return session;
}

export type { StoredSession } from "./store";
