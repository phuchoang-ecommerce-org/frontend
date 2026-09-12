import "server-only";

import { z } from "zod";

/** Mirrors components/schemas/identity.yaml#PasswordChangeRequest. */
export const PasswordChangeRequestSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(1),
    endOtherSessions: z.boolean().optional(),
  })
  .strict();

export type PasswordChangeRequest = z.infer<typeof PasswordChangeRequestSchema>;

/** Mirrors components/schemas/identity.yaml#PasswordResetRequest. */
export const PasswordResetRequestSchema = z
  .object({
    email: z.string().email(),
  })
  .strict();

export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;

/** Mirrors components/schemas/identity.yaml#PasswordReset. */
export const PasswordResetSchema = z
  .object({
    token: z.string().min(1),
    newPassword: z.string().min(1),
  })
  .strict();

export type PasswordReset = z.infer<typeof PasswordResetSchema>;
