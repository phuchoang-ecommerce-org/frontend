import "server-only";

import { cookies } from "next/headers";
import { backendRequest } from "@/lib/api/backend";
import { formatMoney, type Money } from "@/lib/format/money";
import { getSession } from "@/lib/session";
import { GUEST_CART_COOKIE } from "@/lib/session/guest-cart";
import type { CartLineData, CartTotals } from "../types";

export { GUEST_CART_COOKIE } from "@/lib/session/guest-cart";

export type CartWire = {
  id: string;
  expired: boolean;
  lines: {
    id: string;
    variantId: string;
    productName: string;
    variantName?: string;
    quantity: number;
    unitPrice: Money;
    lineTotal: Money;
    stockShort: boolean;
    availableQuantity?: number;
    purchasable: boolean;
    unpurchasableReason?: string;
  }[];
  subtotal: Money;
};

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
  return (await response.json()) as CartWire;
}

export function cartDisplay(cart: CartWire | null): {
  lines: CartLineData[];
  totals: CartTotals;
  expired: boolean;
} {
  const lines =
    cart?.lines.map((line) => ({
      id: line.id,
      productName: line.productName,
      variantLabel: line.variantName,
      href: "/products",
      quantity: line.quantity,
      unitPrice: formatMoney(line.unitPrice),
      lineTotal: formatMoney(line.lineTotal),
      available: line.purchasable,
      notice: line.stockShort
        ? `Only ${line.availableQuantity ?? 0} available. Reduce the quantity to continue.`
        : line.unpurchasableReason || undefined,
    })) ?? [];
  return {
    lines,
    totals: {
      subtotal: formatMoney(cart?.subtotal ?? null),
      total: formatMoney(cart?.subtotal ?? null),
      canCheckout: Boolean(
        lines.length && lines.every((line) => line.available) && !cart?.expired,
      ),
    },
    expired: Boolean(cart?.expired),
  };
}
