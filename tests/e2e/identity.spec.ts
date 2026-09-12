import { expect, test } from "@playwright/test";

/**
 * Happy-path against the Prism mock (npm run mock:api on :4010, and
 * ECP_API_BASE_URL pointed at it — see .env.local / .env.example).
 *
 * Sign-out is exercised at the action level in
 * features/identity/server/actions.contract.test.ts, not via a full
 * /account navigation here: proxy.ts gates /account on the real
 * `ecp_session` cookie's presence, and lib/session's token/CSRF custody is
 * still a no-op this sprint (Sprint 4's EN-FE-API-2) — a successful mock
 * sign-in never actually sets that cookie, so /account isn't reachable
 * end-to-end yet. That's a documented scope limit, not a test gap.
 */
test("register, verify email, and sign in against the mock", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Email").fill(`person-${Date.now()}@example.com`);
  await page.getByLabel("Password").fill("correct horse battery staple");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Check your email")).toBeVisible();

  // Prism doesn't semantically validate the token — any string reaches the
  // schema-conformant 204 example.
  await page.goto("/verify-email?token=any-token");
  await expect(page.getByText("Email verified.")).toBeVisible();

  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("person@example.com");
  await page.getByLabel("Password").fill("correct horse battery staple");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Signed in.")).toBeVisible();
});

// The sign-in-failure / non-disclosive-EmptyState path isn't covered here:
// triggering Prism's 401 example requires a `Prefer: code=401` header on the
// *server's* outbound fetch (the Server Action runs on the Next.js server,
// not the browser), which Playwright's page-level header injection can't
// reach. That path is covered instead by
// features/identity/server/error-mapping.test.ts (Problem → formError
// mapping) and components/ui/empty-state.test.tsx (the rendering itself).
