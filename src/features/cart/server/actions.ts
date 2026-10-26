"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { backendRequest, readProblem } from "@/lib/api/backend";
import { checkActionOrigin } from "@/lib/session/csrf";
import { getSession } from "@/lib/session";
import type { CartChangeResult } from "../types";
import { cartHeaders, GUEST_CART_COOKIE, type CartWire } from "./queries";

function failed(message: string): CartChangeResult {
  return { ok: false, error: message };
}

async function writeCart(
  method: "POST" | "PATCH" | "DELETE",
  path: string,
  body?: object,
  guestId?: string,
): Promise<CartChangeResult> {
  try {
    const response = await backendRequest(path, {
      method,
      headers: await cartHeaders(guestId),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const problem = await readProblem(response);
      return failed(
        response.status === 409
          ? problem.detail ||
              "Stock changed. Check the available quantity and try again."
          : problem.detail || "Your cart could not be updated. Try again.",
      );
    }
    revalidatePath("/cart");
    revalidatePath("/products");
    return { ok: true };
  } catch {
    return failed("Your cart could not be updated. Try again.");
  }
}

export async function addToCartAction(
  variantId: string,
  quantity: number,
): Promise<CartChangeResult> {
  if (!(await checkActionOrigin()))
    return failed("Reload the page and try again.");
  if (!variantId || !Number.isSafeInteger(quantity) || quantity < 1)
    return failed("Choose a variant and a whole quantity greater than zero.");
  const session = await getSession();
  const store = await cookies();
  const existing = store.get(GUEST_CART_COOKIE)?.value;
  const guestId = session ? undefined : existing || randomUUID();
  try {
    const currentResponse = await backendRequest("/carts/current", {
      headers: await cartHeaders(guestId),
    });
    if (!currentResponse.ok)
      return failed("Your cart could not be loaded. Try again.");
    const cart = (await currentResponse.json()) as CartWire;
    const result = await writeCart(
      "POST",
      `/carts/${cart.id}/lines`,
      { variantId, quantity },
      guestId,
    );
    if (result.ok && guestId && !existing) {
      store.set(GUEST_CART_COOKIE, guestId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }
    return result;
  } catch {
    return failed("Your cart could not be updated. Try again.");
  }
}

export async function changeCartQuantityAction(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<CartChangeResult> {
  if (!(await checkActionOrigin()))
    return failed("Reload the page and try again.");
  if (!Number.isSafeInteger(quantity) || quantity < 1)
    return failed("Enter a whole number greater than zero.");
  return writeCart("PATCH", `/carts/${cartId}/lines/${lineId}`, { quantity });
}

export async function removeCartLineAction(
  cartId: string,
  lineId: string,
): Promise<CartChangeResult> {
  if (!(await checkActionOrigin()))
    return failed("Reload the page and try again.");
  return writeCart("DELETE", `/carts/${cartId}/lines/${lineId}`);
}
