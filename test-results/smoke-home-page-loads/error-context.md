# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> home page loads
- Location: tests/e2e/smoke.spec.ts:3:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Enterprise Commerce Platform' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'Enterprise Commerce Platform' }) with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Enterprise Commerce Platform' })

```

```yaml
- banner:
  - link "ECP":
    - /url: /
  - search:
    - searchbox "Search products"
  - link "Cart, 0 items":
    - /url: /cart
    - text: Cart
- main:
  - main:
    - region "Loading section"
- contentinfo:
  - navigation "Footer":
    - link "Categories":
      - /url: /categories
    - link "Account":
      - /url: /account
  - paragraph: © 2026 Enterprise Commerce Platform.
```

# Test source

```ts
  1 | import { expect, test } from "@playwright/test";
  2 | 
  3 | test("home page loads", async ({ page }) => {
  4 |   await page.goto("/");
  5 |   await expect(
  6 |     page.getByRole("heading", { name: "Enterprise Commerce Platform" }),
> 7 |   ).toBeVisible();
    |     ^ Error: expect(locator).toBeVisible() failed
  8 | });
  9 | 
```