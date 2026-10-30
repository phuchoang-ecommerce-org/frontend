import "server-only";

import { randomUUID } from "node:crypto";
import { createClient } from "redis";
import type { BackendSession } from "@/lib/api/identity";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type CheckoutAttempt = {
  confirmationToken: string;
  idempotencyKey: string;
};

/** A payment key is kept server-side so reloads cannot create another attempt. */
export type PaymentAttempt = {
  method: string;
  idempotencyKey: string;
};

export type StoredSession = BackendSession & {
  expiresAt: number;
  checkoutAttempts?: Record<string, CheckoutAttempt>;
  paymentAttempts?: Record<string, PaymentAttempt>;
};

type SessionStore = {
  get(id: string): Promise<StoredSession | null>;
  set(id: string, session: StoredSession): Promise<void>;
  delete(id: string): Promise<void>;
  acquireRefreshLock(id: string, owner: string): Promise<boolean>;
  releaseRefreshLock(id: string, owner: string): Promise<void>;
};

type SessionRedisClient = ReturnType<typeof createClient>;

type SessionRuntime = {
  memorySessions: Map<string, StoredSession>;
  memoryLocks: Map<string, string>;
  redisClient: SessionRedisClient | undefined;
  redisConnection: Promise<SessionRedisClient> | undefined;
};

const runtime = globalThis as typeof globalThis & {
  __ecpSessionRuntime?: SessionRuntime;
};

const state: SessionRuntime = (runtime.__ecpSessionRuntime ??= {
  memorySessions: new Map<string, StoredSession>(),
  memoryLocks: new Map<string, string>(),
  redisClient: undefined,
  redisConnection: undefined,
});

function sessionKey(id: string): string {
  return `sess:${id}`;
}

function refreshLockKey(id: string): string {
  return `sess-refresh:${id}`;
}

const memoryStore: SessionStore = {
  async get(id) {
    return state.memorySessions.get(id) ?? null;
  },
  async set(id, session) {
    state.memorySessions.set(id, session);
  },
  async delete(id) {
    state.memorySessions.delete(id);
  },
  async acquireRefreshLock(id, owner) {
    if (state.memoryLocks.has(id)) return false;
    state.memoryLocks.set(id, owner);
    return true;
  },
  async releaseRefreshLock(id, owner) {
    if (state.memoryLocks.get(id) === owner) state.memoryLocks.delete(id);
  },
};

async function redisClient(): Promise<SessionRedisClient> {
  if (state.redisClient?.isReady) return state.redisClient;
  if (!state.redisConnection) {
    const url = process.env.ECP_SESSION_REDIS_URL;
    if (!url) throw new Error("ECP_SESSION_REDIS_URL is not configured");
    const client = createClient({ url });
    client.on("error", () => {
      // Callers fail closed. Do not log Redis errors that may include credentials.
    });
    state.redisClient = client;
    state.redisConnection = client.connect().then(() => client);
  }
  try {
    return await state.redisConnection;
  } catch (error) {
    state.redisConnection = undefined;
    state.redisClient = undefined;
    throw error;
  }
}

const redisStore: SessionStore = {
  async get(id) {
    const value = await (await redisClient()).get(sessionKey(id));
    if (!value) return null;
    try {
      return JSON.parse(value) as StoredSession;
    } catch {
      await this.delete(id);
      return null;
    }
  },
  async set(id, session) {
    await (await redisClient()).set(sessionKey(id), JSON.stringify(session), {
      EX: SESSION_MAX_AGE_SECONDS,
    });
  },
  async delete(id) {
    await (await redisClient()).del(sessionKey(id));
  },
  async acquireRefreshLock(id, owner) {
    return (
      (await (await redisClient()).set(refreshLockKey(id), owner, {
        NX: true,
        PX: 10_000,
      })) === "OK"
    );
  },
  async releaseRefreshLock(id, owner) {
    await (await redisClient()).eval(
      "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end",
      { keys: [refreshLockKey(id)], arguments: [owner] },
    );
  },
};

export function sessionStore(): SessionStore {
  if (process.env.ECP_SESSION_REDIS_URL) return redisStore;
  const profile = process.env.ECP_FRONTEND_PROFILE;
  const productionProfile =
    profile === "prod" ||
    (profile === undefined && process.env.NODE_ENV === "production");
  if (productionProfile) {
    throw new Error(
      "ECP_SESSION_REDIS_URL is required in production so sessions survive restarts and work across replicas",
    );
  }
  return memoryStore;
}

export function newRefreshLockOwner(): string {
  return randomUUID();
}
