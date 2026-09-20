import type { CatalogSort } from "../server/queries";

export type CategorySearchParams = {
  cursor?: string;
  sort?: string;
};

export type CategoryUrlState = {
  cursor?: string;
  sort?: CatalogSort;
};

export function parseCategorySearchParams(
  searchParams: CategorySearchParams,
): CategoryUrlState {
  const sort = searchParams.sort;
  return {
    ...(searchParams.cursor ? { cursor: searchParams.cursor } : {}),
    ...(sort === "price" || sort === "createdAt" || sort === "popularity"
      ? { sort }
      : {}),
  };
}

export function categoryHref(
  slug: string[],
  params: CategoryUrlState = {},
): string {
  const query = new URLSearchParams();
  if (params.cursor) query.set("cursor", params.cursor);
  if (params.sort) query.set("sort", params.sort);
  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  return `/c/${slug.map(encodeURIComponent).join("/")}${suffix}`;
}
