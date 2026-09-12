import { describe, expect, it } from "vitest";

import { readOptionalSection } from "./authz";
import { ApiProblem } from "./errors";
import type { Problem } from "./schema";

function problem(overrides: Partial<Problem> = {}): Problem {
  return {
    type: "https://ecp.example/errors/ECP-GEN-4030",
    title: "Forbidden",
    status: 403,
    code: "ECP-GEN-4030",
    instance: "/admin/reports",
    errors: [],
    ...overrides,
  };
}

describe("readOptionalSection", () => {
  it("returns the fetched value on success", async () => {
    await expect(readOptionalSection(() => Promise.resolve({ total: 42 }))).resolves.toEqual({
      total: 42,
    });
  });

  it("returns null on a 403 (US-AUD-03/FE — section absent, no explanation)", async () => {
    await expect(
      readOptionalSection(() => Promise.reject(new ApiProblem(problem()))),
    ).resolves.toBeNull();
  });

  it("rethrows a 404 unchanged — that stays notFound()'s job, not this helper's", async () => {
    const notFound = new ApiProblem(problem({ code: "ECP-GEN-4040", status: 404 }));
    await expect(readOptionalSection(() => Promise.reject(notFound))).rejects.toBe(notFound);
  });

  it("rethrows a non-ApiProblem error unchanged", async () => {
    const err = new Error("transport failure");
    await expect(readOptionalSection(() => Promise.reject(err))).rejects.toBe(err);
  });
});
