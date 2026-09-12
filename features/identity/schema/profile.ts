import "server-only";

import { z } from "zod";

/** Mirrors components/schemas/identity.yaml#ProfileUpdate (additionalProperties: false). */
export const ProfileUpdateRequestSchema = z
  .object({
    displayName: z.string().optional(),
    email: z.string().email().optional(),
  })
  .strict();

export type ProfileUpdateRequest = z.infer<typeof ProfileUpdateRequestSchema>;
