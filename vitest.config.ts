import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": dirname,
      // Vitest runs plain Node resolution (no bundler "react-server"
      // condition), so the real server-only package would throw on import.
      // Use its own published no-op build for the "react-server" condition.
      "server-only": path.resolve(dirname, "node_modules/server-only/empty.js"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    exclude: ["node_modules/**", "tests/e2e/**"],
  },
});
