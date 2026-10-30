import "server-only";

import { z } from "zod";
import { backendRequest } from "./backend";
import type { components } from "./types";

export type ShippingQuote = components["schemas"]["ShippingQuote"];
export type Shipment = components["schemas"]["Shipment"];
export type OrderTracking = components["schemas"]["OrderTracking"];
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
const trackingEventSchema = z.object({
  id: z.string().min(1),
  status: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  carrierOccurredAt: z.string().datetime(),
  receivedAt: z.string().datetime(),
  applied: z.boolean(),
});
const shipmentSchema = z.object({
  id: z.string().min(1),
  orderId: z.string().min(1),
  carrier: z.string().min(1),
  trackingReference: z.string().min(1).optional(),
  carrierTrackingUrl: z.string().url().optional(),
  status: z.string().min(1),
  destinationPostalCode: z.string().optional(),
  destinationCountryCode: z.string().regex(/^[A-Z]{2}$/).optional(),
  lineIds: z.array(z.string().min(1)).optional(),
  codAmount: moneySchema.optional(),
  trackingEvents: z.array(trackingEventSchema).optional(),
  lastUpdateReceivedAt: z.string().datetime().optional(),
  dispatchedAt: z.string().datetime().optional(),
  deliveredAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
});
const orderTrackingSchema = z.object({
  orderId: z.string().min(1),
  orderNumber: z.string().optional(),
  status: z.string().min(1),
  shipments: z.array(shipmentSchema).optional(),
  estimatedDeliveryFrom: z.string().datetime().optional(),
  estimatedDeliveryTo: z.string().datetime().optional(),
  returnWindowEndsAt: z.string().datetime().optional(),
});

type ApiShippingQuote = z.infer<typeof shippingQuoteSchema>;
type ApiShipment = z.infer<typeof shipmentSchema>;
type ApiOrderTracking = z.infer<typeof orderTrackingSchema>;
type ShippingQuoteContractCompatibility = ShippingQuote extends ApiShippingQuote
  ? true
  : never;
const shippingQuoteContractCompatibility: ShippingQuoteContractCompatibility = true;
void shippingQuoteContractCompatibility;

const shipmentContractCompatibility: Shipment extends ApiShipment ? true : never = true;
void shipmentContractCompatibility;

const orderTrackingContractCompatibility: OrderTracking extends ApiOrderTracking
  ? true
  : never = true;
void orderTrackingContractCompatibility;

function bearer(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

export function parseShippingQuote(value: unknown): ShippingQuote {
  return shippingQuoteSchema.parse(value) as ShippingQuote;
}

export function parseShipment(value: unknown): Shipment {
  return shipmentSchema.parse(value) as Shipment;
}

export function parseShipments(value: unknown): Shipment[] {
  return z.array(shipmentSchema).parse(value) as Shipment[];
}

export function parseOrderTracking(value: unknown): OrderTracking {
  return orderTrackingSchema.parse(value) as OrderTracking;
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

/** Reads fresh tracking data; carrier events are never treated as client-cached state. */
export async function listOrderShipments(
  accessToken: string,
  orderId: string,
): Promise<Shipment[]> {
  const response = await backendRequest(
    `/orders/${encodeURIComponent(orderId)}/shipments`,
    { headers: bearer(accessToken), cache: "no-store" },
  );
  if (!response.ok) throw response;
  return parseShipments(await response.json());
}

export async function getOrderTracking(
  accessToken: string,
  orderId: string,
): Promise<OrderTracking> {
  const response = await backendRequest(
    `/orders/${encodeURIComponent(orderId)}/tracking`,
    { headers: bearer(accessToken), cache: "no-store" },
  );
  if (!response.ok) throw response;
  return parseOrderTracking(await response.json());
}

export type ShipmentWrite = components["schemas"]["ShipmentWrite"];

export async function createShipment(
  accessToken: string,
  input: ShipmentWrite,
): Promise<Shipment> {
  const response = await backendRequest("/shipments", {
    method: "POST",
    headers: bearer(accessToken),
    body: JSON.stringify(input),
    cache: "no-store",
  });
  if (!response.ok) throw response;
  return parseShipment(await response.json());
}
