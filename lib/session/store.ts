import "server-only";

/**
 * Server-side session state — the opaque `ecp_session` cookie is only a key
 * into this. Never a JWT itself (Frontend Architecture.md §4.1).
 */
export interface SessionRecord {
  accessToken: string;
  refreshToken?: string;
  /** Epoch ms. */
  expiresAt: number;
  /** The signed value also held in the `ecp_csrf` cookie. */
  csrfToken: string;
  account: unknown;
}

export interface SessionStore {
  get(sessionId: string): SessionRecord | undefined;
  set(sessionId: string, record: SessionRecord): void;
  delete(sessionId: string): void;
  /**
   * Per-session mutex. Resolves a release function once the lock is held, or
   * `null` if `timeoutMs` elapses first — a lock that outlives its holder
   * converts a refresh race into a hang (Frontend Architecture.md §4.2), so
   * callers must treat `null` as "could not refresh," never wait longer.
   */
  acquireLock(sessionId: string, timeoutMs: number): Promise<(() => void) | null>;
}

/**
 * In-memory, single-process implementation — a Sprint 4 scope decision
 * (PM-docs/sprint-backlogs/sprint-04-authorisation.md). Does not survive a
 * process restart and does not work across horizontally-scaled `ecp-web`
 * instances; not production-viable as-is. Behind the `SessionStore`
 * interface above so swapping in a distributed store (Redis) later is a
 * one-file change, not a redesign.
 */
class InMemorySessionStore implements SessionStore {
  private readonly records = new Map<string, SessionRecord>();
  private readonly locks = new Map<string, Promise<void>>();

  get(sessionId: string): SessionRecord | undefined {
    return this.records.get(sessionId);
  }

  set(sessionId: string, record: SessionRecord): void {
    this.records.set(sessionId, record);
  }

  delete(sessionId: string): void {
    this.records.delete(sessionId);
  }

  async acquireLock(sessionId: string, timeoutMs: number): Promise<(() => void) | null> {
    // Wait out any in-flight holder for this key. Each iteration is atomic
    // with respect to other waiters: nothing yields between the `while`
    // check and installing the new lock below, so exactly one waiter wins
    // per release.
    for (;;) {
      const inFlight = this.locks.get(sessionId);
      if (!inFlight) break;

      const TIMED_OUT = Symbol("timeout");
      let timer: ReturnType<typeof setTimeout>;
      const timeout = new Promise<typeof TIMED_OUT>((resolve) => {
        timer = setTimeout(() => resolve(TIMED_OUT), timeoutMs);
      });
      const result = await Promise.race([inFlight, timeout]);
      clearTimeout(timer!);
      if (result === TIMED_OUT) return null;
    }

    let release!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    this.locks.set(sessionId, held);

    return () => {
      this.locks.delete(sessionId);
      release();
    };
  }
}

export const sessionStore: SessionStore = new InMemorySessionStore();

/** Exposed for tests that need an isolated store rather than the shared singleton. */
export function createInMemorySessionStore(): SessionStore {
  return new InMemorySessionStore();
}
