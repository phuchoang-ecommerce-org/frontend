import { describe, expect, it } from "vitest";

import { addressCursor, addressesHref } from "./addresses";

describe("address URL contract", () => {
  it("passes the cursor through opaquely", () => {
    expect(addressCursor({ cursor: "opaque+/cursor" })).toBe("opaque+/cursor");
    expect(addressesHref("opaque+/cursor")).toBe(
      "/account/addresses?cursor=opaque%2B%2Fcursor",
    );
  });
});
