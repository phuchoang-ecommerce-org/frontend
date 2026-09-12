import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";
import boundaries from "eslint-plugin-boundaries";
import tailwind from "eslint-plugin-tailwindcss";
import react from "eslint-plugin-react";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      "boundaries/elements": [
        // "app/**" (not "app/*"): route groups nest layouts/pages/error
        // boundaries a level deeper than the old flat app/ — Sprint 1's
        // review notes already found the single-star form silently
        // misclassifies nested files as "unknown" elements.
        { type: "app", pattern: "app/**" },
        { type: "features", pattern: "features/*", capture: ["feature"] },
        // "**" (not "*"): same single-star depth bug Sprint 1 found for
        // lib/api/* et al. — a bare "components/ui/*" pattern doesn't
        // reliably match a direct file in this eslint-plugin-boundaries
        // version's underlying matcher.
        { type: "components-ui", pattern: "components/ui/**" },
        { type: "components-layout", pattern: "components/layout/**" },
        { type: "lib-api", pattern: "lib/api/**" },
        { type: "lib-session", pattern: "lib/session/**" },
        { type: "lib-observability", pattern: "lib/observability/**" },
        { type: "lib-motion", pattern: "lib/motion/**" },
        { type: "lib-utils", pattern: "lib/utils/**" },
        { type: "stores", pattern: "stores/**" },
      ],
    },
    plugins: { boundaries, react },
    rules: {
      // Type safety — no-explicit-any is an error, no-unsafe-* enabled.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",

      // Security bans.
      "react/no-danger": "error",

      // Import boundaries (Feature Structure.md §4, rules I-1..I-8).
      "boundaries/no-unknown-dependencies": "error",
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          policies: [
            // I-1: features/A never imports features/B.
            {
              from: { element: { type: "features" } },
              allow: [
                {
                  to: {
                    element: {
                      type: "features",
                      captured: { feature: "{{from.captured.feature}}" },
                    },
                  },
                },
              ],
            },
            // I-2: app/ may import features/*, components/*, lib/*, stores/.
            {
              from: { element: { type: "app" } },
              allow: [
                {
                  to: {
                    element: {
                      type: [
                        "features",
                        "components-ui",
                        "components-layout",
                        "lib-api",
                        "lib-session",
                        "lib-observability",
                        "lib-motion",
                        "lib-utils",
                        "stores",
                      ],
                    },
                  },
                },
              ],
            },
            // I-3: features/* may import components/*, lib/*, stores/ — never app/.
            {
              from: { element: { type: "features" } },
              allow: [
                {
                  to: {
                    element: {
                      type: [
                        "components-ui",
                        "components-layout",
                        "lib-api",
                        "lib-session",
                        "lib-observability",
                        "lib-motion",
                        "lib-utils",
                        "stores",
                      ],
                    },
                  },
                },
              ],
            },
            // lib/api may import lib/session (headers.ts's token/CSRF seam) and
            // lib/utils. I-4 ("only lib/api/index.ts is importable from outside
            // lib/api") is enforced by .dependency-cruiser.cjs instead of here:
            // eslint-plugin-boundaries classifies by folder, not by individual
            // file, so it cannot distinguish index.ts from its sibling files
            // within the same element type — dependency-cruiser's path-regex
            // rules can and do.
            {
              from: { element: { type: "lib-api" } },
              allow: [
                {
                  to: {
                    element: {
                      type: ["lib-session", "lib-observability", "lib-utils"],
                    },
                  },
                },
              ],
            },
            // I-5: components/ui and components/layout import nothing from features/ or lib/api.
            {
              from: { element: { type: ["components-ui", "components-layout"] } },
              allow: [
                {
                  to: {
                    element: {
                      type: ["components-ui", "components-layout", "lib-motion", "lib-utils"],
                    },
                  },
                },
              ],
            },
            // I-7: no server file imports stores/ (approximated at folder level here;
            // 'server-only' enforces the precise file-level rule at build time).
            {
              from: {
                element: { type: ["lib-session", "lib-observability"] },
              },
              allow: [{ to: { element: { type: "lib-utils" } } }],
            },
          ],
        },
      ],
    },
  },
  // Design-system bans on application/component source — the token definitions
  // in styles/ and the contrast test that asserts against them are the exception.
  {
    files: [
      "app/**/*.{ts,tsx}",
      "components/**/*.{ts,tsx}",
      "features/**/*.{ts,tsx}",
    ],
    ignores: ["**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Literal[value=/outline\\s*:\\s*(none|0)/i], TemplateElement[value.raw=/outline\\s*:\\s*(none|0)/i]",
          message:
            "Do not remove the focus outline via `outline: none`. Use a visible focus-visible ring instead (UI Design System §14).",
        },
        {
          selector:
            "Literal[value=/#[0-9a-fA-F]{3,8}\\b/], TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}\\b/]",
          message:
            "No raw hex colours in component source. Use a Ma design token from styles/theme.css (ADR-0022).",
        },
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { tailwindcss: tailwind },
    rules: {
      // Design-system bans: arbitrary values (p-[25px]) fail lint.
      "tailwindcss/no-arbitrary-value": "error",
    },
    settings: {
      tailwindcss: {
        cssConfigPath: "./styles/theme.css",
      },
    },
  },
  // No arithmetic on Money.amount anywhere except its one sanctioned
  // formatter (lib/api/money.ts's formatMoney) — Money.amount is a decimal
  // string precisely so no client parser turns it into a binary float
  // (Data Fetching.md §3, Integration Contract §2).
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["lib/api/money.ts", "**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.name=/^(Number|parseFloat|parseInt)$/] MemberExpression[property.name='amount']",
          message:
            "Do not coerce Money.amount to a number for arithmetic. Use lib/api's formatMoney at the presentation layer only.",
        },
        {
          selector: "UnaryExpression[operator='+'] MemberExpression[property.name='amount']",
          message: "Do not coerce Money.amount with unary +.",
        },
      ],
    },
  },
  // I-8: @tanstack/react-query is importable from exactly these feature paths.
  {
    files: ["**/*.{ts,tsx}"],
    ignores: [
      "features/search/**",
      "features/cart/**",
      "features/payment/**",
      "features/administration/**",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@tanstack/react-query",
              message:
                "Data Fetching.md §5 (rule I-8): @tanstack/react-query is importable only from features/{search,cart,payment,administration}.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
    "*.config.{js,mjs,cjs,ts}",
    ".dependency-cruiser.cjs",
    "lib/api/generated/**",
  ]),
]);

export default eslintConfig;
