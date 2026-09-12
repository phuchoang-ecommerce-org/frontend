import "server-only";

import { apiQuery, cursorQuery, toPage, type Page } from "@/lib/api";

import { OrderPageSchema, type Order } from "../schema/order";

/**
 * `listOrders` — GET /orders. `(account)` is R3, never cached. Returns an
 * empty page against the real API this sprint: the `ordering` module doesn't
 * exist yet (Sprint 18). That empty page is the expected, designed outcome —
 * not a bug (Sprint 05 Integration Risk note).
 */
export async function listOrders(cursor?: string, size?: number): Promise<Page<Order>> {
  const envelope = await apiQuery(
    { path: "/orders", query: cursorQuery(cursor, size), cache: "no-store" },
    OrderPageSchema,
  );
  return toPage(envelope);
}
