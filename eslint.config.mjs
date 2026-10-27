// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";
import boundaries from "eslint-plugin-boundaries";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "src/app/*" },
        {
          type: "feature",
          pattern: "src/features/*",
          capture: ["feature"],
        },
        { type: "lib", pattern: "src/lib/*" },
        { type: "component", pattern: "src/components/*" },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          policies: [
            {
              allow: { dependency: { relationship: "internal" } },
            },
            {
              from: { element: { type: "app" } },
              allow: { to: { element: { types: ["feature", "lib", "component"] } } },
            },
            {
              from: { element: { type: "feature" } },
              allow: { to: { element: { types: ["lib", "component"] } } },
            },
            {
              from: { element: { type: "lib" } },
              allow: { to: { element: { type: "lib" } } },
            },
            {
              from: { element: { type: "component" } },
              allow: { to: { element: { type: "component" } } },
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "storybook-static/**",
    "next-env.d.ts",
  ]),
  ...storybook.configs["flat/recommended"]
]);

export default eslintConfig;
