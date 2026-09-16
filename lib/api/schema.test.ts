import { describe, expect, it } from "vitest";

import { ProblemSchema } from "./schema";

describe("ProblemSchema", () => {
  it("parses the server-authoritative category deletion blocker", () => {
    const parsed = ProblemSchema.parse({
      type: "https://ecp.example/errors/ECP-CAT-4090",
      title: "Category still contains assigned records",
      status: 409,
      code: "ECP-CAT-4090",
      instance: "/api/v1/categories/018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e12",
      errors: [],
      blocking: { productCount: 12, childCategoryCount: 3 },
    });

    expect(parsed.blocking).toEqual({
      productCount: 12,
      childCategoryCount: 3,
    });
  });
});
