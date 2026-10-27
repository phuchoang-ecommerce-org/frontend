import { describe, expect, it } from "vitest";
import { cursorPaginationHrefs, readCursorPage } from "./pagination";

describe("cursor pagination", () => {
  it("links the first page forward without inventing cursor meaning", () => {
    const page = readCursorPage({});

    expect(page).toEqual({ before: [], pageNumber: 1 });
    expect(cursorPaginationHrefs("/products", page, "cursor-1")).toEqual({
      nextHref: "/products?cursor=cursor-1",
    });
  });

  it("links the second page back to the collection root", () => {
    const page = readCursorPage({ cursor: "cursor-1" });

    expect(page.pageNumber).toBe(2);
    expect(cursorPaginationHrefs("/products", page, "cursor-2")).toEqual({
      previousHref: "/products",
      nextHref: "/products?cursor=cursor-2&before=cursor-1",
    });
  });

  it("preserves the cursor trail across later forward and backward links", () => {
    const page = readCursorPage({
      cursor: "cursor-3",
      before: ["cursor-1", "cursor-2"],
    });

    expect(page.pageNumber).toBe(4);
    expect(cursorPaginationHrefs("/products", page, "cursor-4")).toEqual({
      previousHref: "/products?cursor=cursor-2&before=cursor-1",
      nextHref:
        "/products?cursor=cursor-4&before=cursor-1&before=cursor-2&before=cursor-3",
    });
  });

  it("ignores a trail when there is no current cursor", () => {
    expect(readCursorPage({ before: "untrusted-cursor" })).toEqual({
      before: [],
      pageNumber: 1,
    });
  });
});
