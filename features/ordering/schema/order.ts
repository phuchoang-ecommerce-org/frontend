import "server-only";

import { z } from "zod";

import { AddressSchema, MoneySchema, pageEnvelopeSchema } from "@/lib/api";

/** Mirrors components/schemas/ordering.yaml#OrderStatus — open vocabulary (`x-extensible-enum`), z.string() not z.enum(). */
export const OrderStatusSchema = z.string();

/** Mirrors components/schemas/ordering.yaml#OrderLine. */
export const OrderLineSchema = z
  .object({
    id: z.string(),
    variantId: z.string(),
    sku: z.string(),
    productName: z.string(),
    variantName: z.string().optional(),
    quantity: z.number().int().min(1),
    unitPriceAtOrder: MoneySchema,
    lineDiscount: MoneySchema.optional(),
    lineTotal: MoneySchema,
  })
  .passthrough();

export type OrderLine = z.infer<typeof OrderLineSchema>;

/** Mirrors components/schemas/ordering.yaml#Order. Every figure and both addresses are frozen at placement (`BR-ORD-06`). */
export const OrderSchema = z
  .object({
    id: z.string(),
    orderNumber: z.string(),
    customerId: z.string().optional(),
    status: OrderStatusSchema,
    currency: z.string().regex(/^[A-Z]{3}$/),
    lines: z.array(OrderLineSchema),
    subtotal: MoneySchema,
    discount: MoneySchema.optional(),
    shippingFee: MoneySchema.optional(),
    tax: MoneySchema.optional(),
    total: MoneySchema,
    promotionId: z.string().optional(),
    promotionCode: z.string().optional(),
    shippingAddress: AddressSchema.optional(),
    billingAddress: AddressSchema.optional(),
    placedAt: z.string().optional(),
    paidAt: z.string().optional(),
    deliveredAt: z.string().optional(),
    returnWindowEndsAt: z.string().optional(),
    cancelledReason: z.string().optional(),
    permittedTransitions: z.array(OrderStatusSchema).optional(),
    createdAt: z.string(),
  })
  .passthrough();

export type Order = z.infer<typeof OrderSchema>;

/** Mirrors components/schemas/ordering.yaml#OrderPage. */
export const OrderPageSchema = pageEnvelopeSchema(OrderSchema);
