"use server";

import { signInWithCredentials } from "./login";
import { devAccounts, devLoginEnabled } from "./dev-config";
import type { FormResult } from "../types";

export async function devLoginAction(
  accountKey: string,
  returnTo?: string,
  csrfToken = "",
): Promise<FormResult> {
  if (!devLoginEnabled())
    return { ok: false, message: "Dev sign-in is unavailable." };
  if (returnTo && !["/", "/welcome", "/cart"].includes(returnTo))
    return { ok: false, message: "The requested page is unavailable." };
  const account = devAccounts.find((item) => item.key === accountKey);
  if (!account)
    return { ok: false, message: "That dev account is unavailable." };
  return signInWithCredentials(
    account.email,
    process.env.ECP_DEMO_PASSWORD!,
    csrfToken,
  );
}
