import { describe, expect, it } from "vitest";

import { orderCursor, ordersHref } from "./orders";

describe("order URL contract", () => {
  it("passes the cursor through opaquely", () => {
    expect(orderCursor({ cursor: "opaque+/cursor" })).toBe("opaque+/cursor");
    expect(ordersHref("opaque+/cursor")).toBe(
      "/account/orders?cursor=opaque%2B%2Fcursor",
    );
  });
});
