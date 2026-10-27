"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  backendRequest,
  problemMessage,
  readProblem,
} from "@/lib/api/backend";
import { checkActionCsrf } from "@/lib/session/csrf";
import { getSession } from "@/lib/session";
import type { CartChangeResult } from "../types";
import { cartHeaders, GUEST_CART_COOKIE, parseCartWire } from "./queries";

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
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) {
      const problem = await readProblem(response);
      return failed(
        problemMessage(problem, "Your cart could not be updated. Try again."),
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
  csrfToken: string,
): Promise<CartChangeResult> {
  if (!(await checkActionCsrf(csrfToken)))
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
    const cart = parseCartWire(await currentResponse.json());
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
  csrfToken: string,
): Promise<CartChangeResult> {
  if (!(await checkActionCsrf(csrfToken)))
    return failed("Reload the page and try again.");
  if (!Number.isSafeInteger(quantity) || quantity < 0)
    return failed("Enter a whole number of zero or more.");
  return writeCart("PATCH", `/carts/${cartId}/lines/${lineId}`, { quantity });
}

export async function removeCartLineAction(
  cartId: string,
  lineId: string,
  csrfToken: string,
): Promise<CartChangeResult> {
  if (!(await checkActionCsrf(csrfToken)))
    return failed("Reload the page and try again.");
  return writeCart("DELETE", `/carts/${cartId}/lines/${lineId}`);
}
