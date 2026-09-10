import { describe, expect, it } from "vitest";

import { cursorQuery } from "../pagination";

describe("cursorQuery", () => {
  it("omits absent cursor and size", () => {
    expect(cursorQuery()).toEqual({});
  });

  it("builds cursor and size query params", () => {
    expect(cursorQuery("eyJvIjoxMjM0fQ", 20)).toEqual({
      cursor: "eyJvIjoxMjM0fQ",
      size: "20",
    });
  });

  it("has no page-number concept anywhere in this module", () => {
    expect(Object.keys(cursorQuery("c", 5)).sort()).toEqual(["cursor", "size"]);
  });
});
