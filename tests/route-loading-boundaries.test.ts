import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fetchingPages = [
  "app/(storefront)/page.tsx",
  "app/(storefront)/c/[...slug]/page.tsx",
  "app/(storefront)/p/[productId]/page.tsx",
  "app/(storefront)/product-demo/page.tsx",
  "app/(auth)/verify-email/page.tsx",
  "app/(account)/account/orders/page.tsx",
  "app/(account)/account/profile/page.tsx",
  "app/(account)/account/addresses/page.tsx",
  "app/(account)/account/addresses/[addressId]/page.tsx",
];

function hasLoadingBoundary(page: string) {
  let segment = path.dirname(path.join(root, page));
  const appRoot = path.join(root, "app");
  while (segment.startsWith(appRoot)) {
    if (existsSync(path.join(segment, "loading.tsx"))) return true;
    segment = path.dirname(segment);
  }
  return false;
}

describe("fetching route boundaries", () => {
  it("flags a delivered fetching route segment without a shaped loading boundary", () => {
    for (const page of fetchingPages) {
      expect(readFileSync(path.join(root, page), "utf8")).toMatch(
        /await|async/,
      );
      expect(
        hasLoadingBoundary(page),
        `${page} needs loading.tsx in its segment or an ancestor`,
      ).toBe(true);
    }
  });
});
