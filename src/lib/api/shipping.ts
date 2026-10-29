import "server-only";

import { z } from "zod";
import { backendRequest } from "./backend";
import type { components } from "./types";

export type ShippingQuote = components["schemas"]["ShippingQuote"];
export type ShippingQuoteQuery = {
  checkoutId?: components["schemas"]["Id"];
  postalCode?: string;
  countryCode?: string;
};

const moneySchema = z.object({
  amount: z.string().regex(/^-?[0-9]{1,15}(\.[0-9]{1,4})?$/),
  currency: z.string().regex(/^[A-Z]{3}$/),
});
const shippingQuoteSchema = z.object({
  options: z.array(
    z.object({
      id: z.string().min(1),
      carrier: z.string(),
      serviceName: z.string().optional(),
      fee: moneySchema,
      estimatedDeliveryFrom: z.string().datetime().optional(),
      estimatedDeliveryTo: z.string().datetime().optional(),
      freeShippingApplied: z.boolean().optional(),
    }),
  ),
  shipmentCount: z.number().int().positive().optional(),
});

type ApiShippingQuote = z.infer<typeof shippingQuoteSchema>;
type ShippingQuoteContractCompatibility = ShippingQuote extends ApiShippingQuote
  ? true
  : never;
const shippingQuoteContractCompatibility: ShippingQuoteContractCompatibility = true;
void shippingQuoteContractCompatibility;

function bearer(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

export function parseShippingQuote(value: unknown): ShippingQuote {
  return shippingQuoteSchema.parse(value) as ShippingQuote;
}

export async function getShippingQuotes(
  accessToken: string,
  query: ShippingQuoteQuery,
): Promise<ShippingQuote> {
  const params = new URLSearchParams();
  if (query.checkoutId) params.set("checkoutId", query.checkoutId);
  if (query.postalCode) params.set("postalCode", query.postalCode);
  if (query.countryCode) params.set("countryCode", query.countryCode);
  const response = await backendRequest(
    `/shipping-quotes${params.size ? `?${params.toString()}` : ""}`,
    { headers: bearer(accessToken), cache: "no-store" },
  );
  if (!response.ok) throw response;
  return parseShippingQuote(await response.json());
}
