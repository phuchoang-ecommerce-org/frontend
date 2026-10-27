const features = [
  "identity",
  "catalog",
  "cart",
  "inventory",
  "ordering",
  "shipping",
  "payment",
];

/** @type {import('dependency-cruiser').IConfiguration} */
const config = {
  forbidden: [
    {
      name: "no-circular",
      comment: "Source modules must remain acyclic.",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    ...features.map((feature) => ({
      name: `no-${feature}-to-other-features`,
      comment: "Feature composition belongs in app routes, not another feature.",
      severity: "error",
      from: { path: `^src/features/${feature}/` },
      to: { path: `^src/features/(?!${feature}/)` },
    })),
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "(^|/)node_modules/|\\.stories\\.|\\.test\\." },
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      conditionNames: ["types", "import", "default"],
      exportsFields: ["exports"],
    },
  },
};

export default config;
