export type AddressSearchParams = { cursor?: string };

export function addressCursor(
  searchParams: AddressSearchParams,
): string | undefined {
  return searchParams.cursor;
}

export function addressesHref(cursor: string): string {
  return `/account/addresses?cursor=${encodeURIComponent(cursor)}`;
}
