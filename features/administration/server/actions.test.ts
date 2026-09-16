import { describe, expect, it, vi } from "vitest";

const apiMutate = vi.hoisted(() => vi.fn());
const requireCsrf = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  apiMutate,
}));
vi.mock("@/lib/session", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/session")>()),
  requireCsrf,
}));

import { ApiProblem } from "@/lib/api";
import { deleteAdminCategory } from "./actions";

describe("deleteAdminCategory", () => {
  it("renders only server-returned blocking counts for an occupied category", async () => {
    requireCsrf.mockResolvedValue(undefined);
    apiMutate.mockRejectedValue(
      new ApiProblem({
        type: "https://ecp.example/errors/ECP-CAT-4090",
        title: "Category still contains assigned records",
        status: 409,
        code: "ECP-CAT-4090",
        instance: "/api/v1/categories/018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e12",
        errors: [],
        blocking: { productCount: 12, childCategoryCount: 3 },
      }),
    );

    await expect(
      deleteAdminCategory("018f3c2a-7b41-7c9e-9f10-2a4b6c8d0e12", {
        csrfToken: "token",
      }),
    ).resolves.toMatchObject({
      ok: false,
      conflict: "category-removal-blocked",
      blocking: { productCount: 12, childCategoryCount: 3 },
    });
  });
});
