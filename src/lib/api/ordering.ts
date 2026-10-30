import "server-only";

import { z } from "zod";
import { backendRequest } from "./backend";
import type { components } from "./types";

export type Checkout = components["schemas"]["Checkout"];
export type OrderSummary = components["schemas"]["OrderSummary"];
export type Order = components["schemas"]["Order"];
export type OrderPage = components["schemas"]["OrderPage"];
export type OrderPageResult = {
  items: Order[];
  page: { size: number; next?: string | null; total?: number };
};
export type PlaceOrderRequest = components["schemas"]["PlaceOrderRequest"];
export type ShippingAddressSelection =
  components["schemas"]["ShippingAddressSelection"];
export type BillingInformation = components["schemas"]["BillingInformation"];
export type ShippingOptionSelection =
  components["schemas"]["ShippingOptionSelection"];
export type VoucherApplication = components["schemas"]["VoucherApplication"];

const idSchema = z.string().min(1);
const moneySchema = z.object({
  amount: z.string().regex(/^-?[0-9]{1,15}(\.[0-9]{1,4})?$/),
  currency: z.string().regex(/^[A-Z]{3}$/),
});
const addressSchema = z.object({
  label: z.string().optional(),
  recipientName: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  region: z.string().optional(),
  postalCode: z.string().min(1),
  countryCode: z.string().regex(/^[A-Z]{2}$/),
  phone: z.string().optional(),
});
const orderLineSchema = z.object({
  id: idSchema,
  variantId: idSchema,
  sku: z.string(),
  productName: z.string(),
  variantName: z.string().optional(),
  quantity: z.number().int().positive(),
  unitPriceAtOrder: moneySchema,
  lineDiscount: moneySchema.optional(),
  lineTotal: moneySchema,
});
const orderSchema = z.object({
  id: idSchema,
  orderNumber: z.string(),
  customerId: idSchema.optional(),
  status: z.string(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  lines: z.array(orderLineSchema),
  subtotal: moneySchema,
  discount: moneySchema.optional(),
  shippingFee: moneySchema.optional(),
  tax: moneySchema.optional(),
  total: moneySchema,
  promotionId: idSchema.optional(),
  promotionCode: z.string().optional(),
  shippingAddress: addressSchema.optional(),
  billingAddress: addressSchema.optional(),
  placedAt: z.string().datetime().optional(),
  paidAt: z.string().datetime().optional(),
  deliveredAt: z.string().datetime().optional(),
  returnWindowEndsAt: z.string().datetime().optional(),
  cancelledReason: z.string().optional(),
  permittedTransitions: z.array(z.string()).optional(),
  createdAt: z.string().datetime(),
});
const shippingOptionSchema = z.object({
  id: z.string().min(1),
  carrier: z.string(),
  serviceName: z.string().optional(),
  fee: moneySchema,
  estimatedDeliveryFrom: z.string().datetime().optional(),
  estimatedDeliveryTo: z.string().datetime().optional(),
  freeShippingApplied: z.boolean().optional(),
});
const paymentMethodSchema = z.object({
  type: z.string().min(1),
  displayName: z.string().optional(),
  eligible: z.boolean(),
  ineligibleReason: z.string().optional(),
});

const checkoutSchema = z.object({
  order: orderSchema,
  shippingOptions: z.array(shippingOptionSchema).optional(),
  selectedShippingOptionId: z.string().optional(),
  paymentMethod: paymentMethodSchema.optional(),
  ready: z.boolean(),
  blockers: z
    .array(z.object({ code: z.string().min(1), detail: z.string().optional() }))
    .optional(),
});
const orderSummarySchema = z.object({
  order: orderSchema,
  changed: z.boolean(),
  changes: z
    .array(
      z.object({
        field: z.string().min(1),
        previous: z.string().optional(),
        current: z.string().optional(),
      }),
    )
    .optional(),
  confirmationToken: z.string().min(1),
});

type ApiCheckout = z.infer<typeof checkoutSchema>;
type ApiOrderSummary = z.infer<typeof orderSummarySchema>;
type ApiOrder = z.infer<typeof orderSchema>;
type CheckoutContractCompatibility = Checkout extends ApiCheckout
  ? OrderSummary extends ApiOrderSummary
    ? true
    : never
  : never;
const checkoutContractCompatibility: CheckoutContractCompatibility = true;
void checkoutContractCompatibility;

const orderContractCompatibility: Order extends ApiOrder ? true : never = true;
void orderContractCompatibility;

function bearer(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

async function checkoutJson<T>(
  response: Response,
  schema: z.ZodType<T>,
): Promise<T> {
  if (!response.ok) throw response;
  return schema.parse(await response.json());
}

export function parseCheckout(value: unknown): Checkout {
  return checkoutSchema.parse(value) as Checkout;
}

export function parseOrderSummary(value: unknown): OrderSummary {
  return orderSummarySchema.parse(value) as OrderSummary;
}

export function parseOrder(value: unknown): Order {
  return orderSchema.parse(value) as Order;
}

export async function initiateCheckout(accessToken: string): Promise<Checkout> {
  return checkoutJson(
    await backendRequest("/checkouts", {
      method: "POST",
      headers: bearer(accessToken),
      cache: "no-store",
    }),
    checkoutSchema,
  ) as Promise<Checkout>;
}

export async function getCurrentCheckout(
  accessToken: string,
): Promise<Checkout> {
  return checkoutJson(
    await backendRequest("/checkouts/current", {
      headers: bearer(accessToken),
      cache: "no-store",
    }),
    checkoutSchema,
  ) as Promise<Checkout>;
}

export async function setCheckoutShippingAddress(
  accessToken: string,
  checkoutId: string,
  selection: ShippingAddressSelection,
): Promise<Checkout> {
  return writeCheckout(
    accessToken,
    `/checkouts/${encodeURIComponent(checkoutId)}/shipping-address`,
    selection,
  );
}

export async function setCheckoutBillingInformation(
  accessToken: string,
  checkoutId: string,
  information: BillingInformation,
): Promise<Checkout> {
  return writeCheckout(
    accessToken,
    `/checkouts/${encodeURIComponent(checkoutId)}/billing-information`,
    information,
  );
}

export async function selectCheckoutShippingOption(
  accessToken: string,
  checkoutId: string,
  selection: ShippingOptionSelection,
): Promise<Checkout> {
  return writeCheckout(
    accessToken,
    `/checkouts/${encodeURIComponent(checkoutId)}/shipping-option`,
    selection,
  );
}

export async function applyCheckoutVoucher(
  accessToken: string,
  checkoutId: string,
  voucher: VoucherApplication,
): Promise<Checkout> {
  return writeCheckout(
    accessToken,
    `/checkouts/${encodeURIComponent(checkoutId)}/voucher`,
    voucher,
  );
}

export function removeCheckoutVoucher(
  accessToken: string,
  checkoutId: string,
): Promise<Response> {
  return backendRequest(
    `/checkouts/${encodeURIComponent(checkoutId)}/voucher`,
    {
      method: "DELETE",
      headers: bearer(accessToken),
      cache: "no-store",
    },
  );
}

export async function getOrderSummary(
  accessToken: string,
  checkoutId: string,
): Promise<OrderSummary> {
  return checkoutJson(
    await backendRequest(
      `/checkouts/${encodeURIComponent(checkoutId)}/summary`,
      { headers: bearer(accessToken), cache: "no-store" },
    ),
    orderSummarySchema,
  ) as Promise<OrderSummary>;
}

/** The backend binds placement to the reviewed Draft checkout. */
export async function placeOrder(
  accessToken: string,
  input: PlaceOrderRequest,
  idempotencyKey: string,
): Promise<Order> {
  return checkoutJson(
    await backendRequest("/orders", {
      method: "POST",
      headers: {
        ...bearer(accessToken),
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(input),
      cache: "no-store",
    }),
    orderSchema,
  ) as Promise<Order>;
}

export async function getOrder(accessToken: string, orderId: string): Promise<Order> {
  return checkoutJson(
    await backendRequest(`/orders/${encodeURIComponent(orderId)}`, {
      headers: bearer(accessToken),
      cache: "no-store",
    }),
    orderSchema,
  ) as Promise<Order>;
}

export function advanceOrderStatus(
  accessToken: string,
  orderId: string,
  status: string,
  reason?: string,
): Promise<Response> {
  return backendRequest(`/orders/${encodeURIComponent(orderId)}/status-transitions`, {
    method: "POST",
    headers: bearer(accessToken),
    body: JSON.stringify({ status, ...(reason ? { reason } : {}) }),
    cache: "no-store",
  });
}

export async function listOrders(
  accessToken: string,
  cursor?: string,
): Promise<OrderPageResult> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  const pageSchema = z.object({
    items: z.array(orderSchema).optional(),
    page: z.object({ next: z.string().nullable().optional() }).passthrough(),
  }).passthrough();
  return checkoutJson(
    await backendRequest(`/orders${query}`, {
      headers: bearer(accessToken),
      cache: "no-store",
    }),
    pageSchema,
  ) as Promise<OrderPageResult>;
}

async function writeCheckout(
  accessToken: string,
  path: string,
  body: unknown,
): Promise<Checkout> {
  return checkoutJson(
    await backendRequest(path, {
      method: "PUT",
      headers: bearer(accessToken),
      body: JSON.stringify(body),
      cache: "no-store",
    }),
    checkoutSchema,
  ) as Promise<Checkout>;
}
