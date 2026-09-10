/**
 * Graph-level checks that a per-file ESLint rule cannot see — chiefly cycles.
 * Mirrors Feature Structure.md §4's import rules (I-1..I-5, I-7); eslint-plugin-boundaries
 * enforces the same edges per-file.
 */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "Dependency cycles are invisible to a per-file lint rule.",
      from: {},
      to: { circular: true },
    },
    {
      name: "features-no-cross-import",
      severity: "error",
      comment: "I-1: features/A never imports from features/B.",
      from: { path: "^features/([^/]+)/", pathNot: "^features/$1/" },
      to: { path: "^features/([^/]+)/", pathNot: "^features/$1/" },
    },
    {
      name: "features-no-app-import",
      severity: "error",
      comment: "I-3: features/* may not import app/.",
      from: { path: "^features/" },
      to: { path: "^app/" },
    },
    {
      name: "ui-no-features-or-api-import",
      severity: "error",
      comment:
        "I-5: components/ui and components/layout import nothing from features/ or lib/api.",
      from: { path: "^components/(ui|layout)/" },
      to: { path: "^(features/|lib/api/)" },
    },
    {
      name: "no-stores-from-server",
      severity: "error",
      comment: "I-7: no server file imports stores/.",
      from: {
        path: "^(lib/api|lib/session|lib/observability|features/[^/]+/server)/",
      },
      to: { path: "^stores/" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
    },
    reporterOptions: {
      text: { highlightFocused: true },
    },
  },
};
