import { describe, expect, it } from "vitest";

import { RatingSummarySchema, ReviewPageSchema } from "./review";

describe("review schemas", () => {
  it("parses an empty real-API rating summary and a populated review page", () => {
    expect(
      RatingSummarySchema.parse({ reviewCount: 0, distribution: {} }),
    ).toMatchObject({ reviewCount: 0 });
    expect(
      ReviewPageSchema.parse({
        items: [],
        page: { size: 3 },
      }),
    ).toMatchObject({ items: [] });
  });
});
