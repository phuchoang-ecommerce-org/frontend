import { describe, expect, it } from "vitest";

import { categoryHref, parseCategorySearchParams } from "./category";

describe("catalog category URL contract", () => {
  it("keeps supported sort and opaque cursor values", () => {
    expect(
      parseCategorySearchParams({ cursor: "opaque+/cursor", sort: "price" }),
    ).toEqual({ cursor: "opaque+/cursor", sort: "price" });
  });

  it("drops unsupported sort values without changing the cursor", () => {
    expect(
      parseCategorySearchParams({ cursor: "opaque-cursor", sort: "unknown" }),
    ).toEqual({ cursor: "opaque-cursor" });
  });

  it("serializes slug segments and query values as the existing route does", () => {
    expect(
      categoryHref(["outdoor gear", "jackets"], {
        cursor: "next+cursor",
        sort: "createdAt",
      }),
    ).toBe("/c/outdoor%20gear/jackets?cursor=next%2Bcursor&sort=createdAt");
  });
});
