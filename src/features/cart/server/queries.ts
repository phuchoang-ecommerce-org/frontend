import "server-only";

import { cookies } from "next/headers";
import { z } from "zod";
import { backendRequest } from "@/lib/api/backend";
import type { components } from "@/lib/api/types";
import { formatMoney } from "@/lib/format/money";
import { getSession } from "@/lib/session";
import { GUEST_CART_COOKIE } from "@/lib/session/guest-cart";
import type { CartLineData, CartTotals } from "../types";

export { GUEST_CART_COOKIE } from "@/lib/session/guest-cart";

type ContractCart = components["schemas"]["Cart"];

const moneySchema = z.object({
  amount: z.string().regex(/^-?[0-9]{1,15}(\.[0-9]{1,4})?$/),
  currency: z.string().regex(/^[A-Z]{3}$/),
});
const cartSchema = z.object({
  id: z.string().min(1),
  customerId: z.string().optional(),
  status: z.string(),
  lines: z.array(
    z.object({
      id: z.string().min(1),
      variantId: z.string().min(1),
      sku: z.string(),
      productId: z.string().optional(),
      productName: z.string().optional(),
      variantName: z.string().optional(),
      imageUrl: z.string().optional(),
      quantity: z.number().int().positive(),
      unitPrice: moneySchema.optional(),
      lineTotal: moneySchema.optional(),
      priceChanged: z.boolean().optional(),
      stockShort: z.boolean().optional(),
      purchasable: z.boolean().optional(),
      unpurchasableReason: z.string().optional(),
      addedAt: z.string().optional(),
    }),
  ),
  subtotal: moneySchema,
  lastActivityAt: z.string().optional(),
  expiresAt: z.string(),
});

export type CartWire = z.infer<typeof cartSchema>;

type CartContractCompatibility = ContractCart extends CartWire ? true : never;
const cartContractCompatibility: CartContractCompatibility = true;
void cartContractCompatibility;

export function parseCartWire(value: unknown): CartWire {
  return cartSchema.parse(value);
}

export async function cartHeaders(guestCartId?: string): Promise<HeadersInit> {
  const session = await getSession();
  if (session) return { Authorization: `Bearer ${session.accessToken}` };
  const id = guestCartId ?? (await cookies()).get(GUEST_CART_COOKIE)?.value;
  return id ? { Cookie: `${GUEST_CART_COOKIE}=${id}` } : {};
}

export async function getCurrentCart(): Promise<CartWire | null> {
  const session = await getSession();
  const guestId = (await cookies()).get(GUEST_CART_COOKIE)?.value;
  if (!session && !guestId) return null;
  const response = await backendRequest("/carts/current", {
    headers: await cartHeaders(guestId),
  });
  if (!response.ok) throw new Error("Cart could not be loaded");
  return parseCartWire(await response.json());
}

export function cartDisplay(cart: CartWire | null): {
  lines: CartLineData[];
  totals: CartTotals;
  expired: boolean;
} {
  const lines =
    cart?.lines.map((line) => ({
      id: line.id,
      productName: line.productName || line.sku,
      ...(line.variantName ? { variantLabel: line.variantName } : {}),
      href: "/products",
      quantity: line.quantity,
      unitPrice: formatMoney(line.unitPrice ?? null),
      lineTotal: formatMoney(line.lineTotal ?? null),
      available: line.purchasable !== false,
      priceChanged: line.priceChanged === true,
      stockShort: line.stockShort === true,
      ...(line.stockShort
        ? {
            notice:
              "Stock is lower than the selected quantity. Reduce it to continue.",
          }
        : line.unpurchasableReason
          ? { notice: line.unpurchasableReason }
          : {}),
    })) ?? [];
  const hasUnavailableLine = lines.some((line) => !line.available);
  const hasStockShortLine = lines.some((line) => line.stockShort);
  return {
    lines,
    totals: {
      subtotal: formatMoney(cart?.subtotal ?? null),
      total: formatMoney(cart?.subtotal ?? null),
      canCheckout: Boolean(
        lines.length &&
        lines.every((line) => line.available) &&
        !hasStockShortLine &&
        cart?.status !== "EXPIRED",
      ),
      ...(hasStockShortLine
        ? {
            checkoutMessage:
              "Reduce the quantities marked with low stock before checkout.",
          }
        : hasUnavailableLine
          ? { checkoutMessage: "Resolve unavailable items before checkout." }
          : {}),
    },
    expired: cart?.status === "EXPIRED",
  };
}
