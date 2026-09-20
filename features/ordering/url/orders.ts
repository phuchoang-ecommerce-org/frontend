export type OrderSearchParams = { cursor?: string };

export function orderCursor(
  searchParams: OrderSearchParams,
): string | undefined {
  return searchParams.cursor;
}

export function ordersHref(cursor: string): string {
  return `/account/orders?cursor=${encodeURIComponent(cursor)}`;
}
