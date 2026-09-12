import "server-only";

import { apiQuery, cursorQuery, toPage, type Page } from "@/lib/api";

import { AccountSchema, type Account } from "../schema/session";
import { CustomerAddressPageSchema, CustomerAddressSchema, type CustomerAddress } from "../schema/address";

/**
 * `(account)` is R3 — never cached (Routing.md §2, Data Fetching.md §2.3).
 * Every read here states `cache: "no-store"` explicitly.
 */

export async function getOwnAccount(): Promise<Account> {
  return apiQuery({ path: "/accounts/me", cache: "no-store" }, AccountSchema);
}

export async function listOwnAddresses(cursor?: string, size?: number): Promise<Page<CustomerAddress>> {
  const envelope = await apiQuery(
    { path: "/accounts/me/addresses", query: cursorQuery(cursor, size), cache: "no-store" },
    CustomerAddressPageSchema,
  );
  return toPage(envelope);
}

/**
 * An address belonging to another customer returns `404`, never `403`
 * (Integration Contract §2.1) — the `ApiProblem` propagates uncaught so the
 * calling page can catch it and call `notFound()`.
 */
export async function getOwnAddress(addressId: string): Promise<CustomerAddress> {
  return apiQuery(
    { path: "/accounts/me/addresses/{addressId}", pathParams: { addressId }, cache: "no-store" },
    CustomerAddressSchema,
  );
}
