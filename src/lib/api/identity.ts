import "server-only";

import { z } from "zod";
import { GUEST_CART_COOKIE } from "@/lib/session/guest-cart";
import { backendRequest } from "./backend";
import type { components } from "./types";

type ContractSession = components["schemas"]["Session"];
type CredentialsRequest = components["schemas"]["CredentialsRequest"];

export type BackendSession = Omit<ContractSession, "refreshToken"> & {
  refreshToken: string;
  // Temporary real-API extension tracked in docs/f1-contract-and-ih1-findings.md.
  cartMergeNotices?: string[];
};

const accountSchema = z.object({
  id: z.string().min(1),
  email: z.email(),
  displayName: z.string().optional(),
  status: z.string(),
  verificationStatus: z.string(),
  pendingEmail: z.email().optional(),
  roles: z.array(z.string()),
  verifiedAt: z.string().optional(),
  lastLoginAt: z.string().optional(),
  createdAt: z.string(),
});
const cartMergeSchema = z.object({
  merged: z.boolean(),
  cartId: z.string().optional(),
  adjustments: z
    .array(
      z.object({
        variantId: z.string(),
        outcome: z.string(),
        requestedQuantity: z.number().int().optional(),
        appliedQuantity: z.number().int().optional(),
        detail: z.string().optional(),
      }),
    )
    .optional(),
});
const backendSessionSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresIn: z.number().int().positive(),
  restricted: z.boolean().optional(),
  account: accountSchema,
  cartMerge: cartMergeSchema.optional(),
  cartMergeNotices: z.array(z.string()).optional(),
});

export function parseBackendSession(value: unknown): BackendSession {
  return backendSessionSchema.parse(value) as BackendSession;
}

export async function requestSession(
  email: string,
  password: string,
  guestCartId?: string,
): Promise<Response> {
  const body: Omit<CredentialsRequest, "guestCartId"> = { email, password };

  return backendRequest("/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(guestCartId
        ? {
            Cookie: `${GUEST_CART_COOKIE}=${encodeURIComponent(guestCartId)}`,
          }
        : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

export async function renewSession(refreshToken: string): Promise<Response> {
  return backendRequest("/session-renewals", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });
}

export async function endSession(refreshToken: string): Promise<void> {
  await backendRequest("/sessions/current", {
    method: "DELETE",
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });
}
