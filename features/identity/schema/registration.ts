import "server-only";

import { z } from "zod";

/** Mirrors components/schemas/identity.yaml#RegistrationRequest (additionalProperties: false). */
export const RegistrationRequestSchema = z
  .object({
    email: z.string().email(),
    // Strength policy is an open item (identity.yaml's own comment: "no
    // document states one") — only non-empty is enforced client-side; the
    // backend is the sole source of truth for any future policy.
    password: z.string().min(1),
    displayName: z.string().optional(),
  })
  .strict();

export type RegistrationRequest = z.infer<typeof RegistrationRequestSchema>;
