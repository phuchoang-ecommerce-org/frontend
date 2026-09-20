"use server";

import { redirect } from "next/navigation";

import { logOut } from "./actions";

/**
 * Adapts identity's typed logout outcome to the account-sidebar form action.
 * The prior route-level adapter redirected after every outcome, including a
 * CSRF failure, so this intentionally preserves that route behavior.
 */
export async function signOutFromAccount(formData: FormData): Promise<void> {
  await logOut({ csrfToken: formData.get("csrfToken") });
  redirect("/sign-in");
}
