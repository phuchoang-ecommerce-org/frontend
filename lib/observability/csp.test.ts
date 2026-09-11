import { describe, expect, it } from "vitest";

import { buildNonceCsp, buildStaticCsp, isR1Path, newNonce } from "./csp";

describe("isR1Path", () => {
  it.each(["/", "/c", "/c/electronics", "/p", "/p/018f3c2a"])(
    "treats %s as R1",
    (path) => {
      expect(isR1Path(path)).toBe(true);
    },
  );

  it.each(["/account", "/admin", "/cart", "/checkout", "/search", "/category"])(
    "treats %s as not R1",
    (path) => {
      expect(isR1Path(path)).toBe(false);
    },
  );
});

describe("buildStaticCsp", () => {
  it("carries no nonce token", () => {
    expect(buildStaticCsp()).not.toContain("nonce-");
  });

  it("disallows unsafe-inline", () => {
    expect(buildStaticCsp()).not.toContain("unsafe-inline");
  });
});

describe("buildNonceCsp", () => {
  it("embeds the given nonce in script-src and style-src", () => {
    const csp = buildNonceCsp("abc123", false);
    expect(csp).toContain("'nonce-abc123'");
    expect(csp.match(/nonce-abc123/g)).toHaveLength(2);
  });

  it("adds unsafe-eval only in development", () => {
    expect(buildNonceCsp("n", true)).toContain("unsafe-eval");
    expect(buildNonceCsp("n", false)).not.toContain("unsafe-eval");
  });
});

describe("newNonce", () => {
  it("returns a fresh value every call", () => {
    expect(newNonce()).not.toBe(newNonce());
  });
});
