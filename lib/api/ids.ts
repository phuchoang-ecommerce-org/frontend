import "server-only";

import { z } from "zod";

/**
 * Identifiers are opaque (Integration Contract §2) — a client never parses,
 * orders, or infers meaning from one. Branding stops a raw string standing
 * in for the wrong resource at a call site without adding any runtime cost.
 */
type Brand<T, B extends string> = T & { readonly __brand: B };

export type ProductId = Brand<string, "ProductId">;
export type SkuId = Brand<string, "SkuId">;
export type CartId = Brand<string, "CartId">;
export type OrderId = Brand<string, "OrderId">;

export const asProductId = (value: string): ProductId => value as ProductId;
export const asSkuId = (value: string): SkuId => value as SkuId;
export const asCartId = (value: string): CartId => value as CartId;
export const asOrderId = (value: string): OrderId => value as OrderId;

export const ProductIdSchema = z.string().uuid().transform(asProductId);
export const SkuIdSchema = z.string().transform(asSkuId);
export const CartIdSchema = z.string().uuid().transform(asCartId);
export const OrderIdSchema = z.string().uuid().transform(asOrderId);
