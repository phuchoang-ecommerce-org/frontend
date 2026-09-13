import { describe, expect, it } from "vitest";

import { CategoryTreeSchema, ProductSummaryPageSchema } from "./category";

describe("catalog response schemas", () => {
  it("parses an arbitrary-depth category tree", () => {
    expect(
      CategoryTreeSchema.parse([
        {
          id: "outerwear",
          name: "Outerwear",
          slug: "outerwear",
          depth: 0,
          children: [
            { id: "jackets", name: "Jackets", slug: "jackets", depth: 1 },
          ],
        },
      ]),
    ).toHaveLength(1);
  });

  it("rejects a listing response without the mandatory pagination envelope", () => {
    expect(() =>
      ProductSummaryPageSchema.parse({
        items: [
          {
            id: "018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e12",
            name: "Jacket",
            slug: "jacket",
            publicationStatus: "PUBLISHED",
          },
        ],
      }),
    ).toThrow();
  });
});
