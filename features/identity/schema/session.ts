import "server-only";

import { z } from "zod";

/** Mirrors components/schemas/identity.yaml#CredentialsRequest (additionalProperties: false). */
export const CredentialsRequestSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1),
    guestCartId: z.string().uuid().optional(),
  })
  .strict();

export type CredentialsRequest = z.infer<typeof CredentialsRequestSchema>;

/**
 * Mirrors components/schemas/identity.yaml#Account. Not additionalProperties:
 * false in the contract, and status/verificationStatus are declared
 * `x-extensible-enum` (open vocabulary) — z.string(), not z.enum(), per the
 * contract's own instruction that clients must tolerate unknown values.
 */
export const AccountSchema = z
  .object({
    id: z.string(),
    email: z.string().email(),
    displayName: z.string().optional(),
    status: z.string(),
    verificationStatus: z.string(),
    pendingEmail: z.string().email().optional(),
    roles: z.array(z.string()),
    verifiedAt: z.string().optional(),
    lastLoginAt: z.string().optional(),
    createdAt: z.string(),
  })
  .passthrough();

export type Account = z.infer<typeof AccountSchema>;

/** Mirrors components/schemas/identity.yaml#Session. */
export const SessionSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string().optional(),
    expiresIn: z.number().int(),
    restricted: z.boolean().optional(),
    account: AccountSchema,
    cartMerge: z.unknown().optional(),
  })
  .passthrough();

export type Session = z.infer<typeof SessionSchema>;

/**
 * What logIn's Server Action actually returns to client code. "No access
 * token ever reaches the browser" (Frontend Architecture.md §4.4) — the
 * full Session (with its tokens) is consumed server-side by
 * lib/session.createSession and never forwarded past that point.
 */
export type PublicSession = Omit<Session, "accessToken" | "refreshToken">;
