import "server-only";

import { z } from "zod";

/** Mirrors components/schemas/identity.yaml#EmailVerificationRequest. */
export const EmailVerificationRequestSchema = z
  .object({
    token: z.string().min(1),
  })
  .strict();

export type EmailVerificationRequest = z.infer<typeof EmailVerificationRequestSchema>;

/** Mirrors components/schemas/identity.yaml#VerificationResendRequest. */
export const VerificationResendRequestSchema = z
  .object({
    email: z.string().email(),
  })
  .strict();

export type VerificationResendRequest = z.infer<typeof VerificationResendRequestSchema>;
