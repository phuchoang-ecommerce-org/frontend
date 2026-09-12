import { describe, expect, it } from "vitest";

import { createInMemorySessionStore } from "./store";
import type { SessionRecord } from "./store";

function record(overrides: Partial<SessionRecord> = {}): SessionRecord {
  return {
    accessToken: "access-1",
    expiresAt: Date.now() + 60_000,
    csrfToken: "csrf-1.sig",
    account: { id: "acct-1" },
    ...overrides,
  };
}

describe("InMemorySessionStore", () => {
  it("round-trips get/set/delete", () => {
    const store = createInMemorySessionStore();
    expect(store.get("s1")).toBeUndefined();

    store.set("s1", record());
    expect(store.get("s1")?.accessToken).toBe("access-1");

    store.delete("s1");
    expect(store.get("s1")).toBeUndefined();
  });

  it("acquireLock resolves immediately when no one else holds the lock", async () => {
    const store = createInMemorySessionStore();
    const release = await store.acquireLock("s1", 1_000);
    expect(release).not.toBeNull();
    release?.();
  });

  it("serialises a second acquire behind the first, until release", async () => {
    const store = createInMemorySessionStore();
    const events: string[] = [];

    const release1 = await store.acquireLock("s1", 1_000);
    events.push("first-acquired");

    const secondAcquire = store.acquireLock("s1", 1_000).then((release2) => {
      events.push("second-acquired");
      return release2;
    });

    // Give the second acquirer a chance to run — it must still be waiting.
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(events).toEqual(["first-acquired"]);

    release1?.();
    const release2 = await secondAcquire;
    expect(events).toEqual(["first-acquired", "second-acquired"]);
    release2?.();
  });

  it("times out and returns null rather than waiting forever for a stuck holder", async () => {
    const store = createInMemorySessionStore();
    await store.acquireLock("s1", 1_000); // never released

    const result = await store.acquireLock("s1", 30);
    expect(result).toBeNull();
  });
});
