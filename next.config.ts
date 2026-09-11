import type { NextConfig } from "next";
import { buildStaticCsp } from "./lib/observability/csp";

// R1 routes (home, category, product detail) carry a static CSP with no
// nonce, verified instead by Subresource Integrity — this is what keeps
// them statically generated and cacheable while proxy.ts's per-request
// nonce covers every other route class (Performance.md §7).
const nextConfig: NextConfig = {
  experimental: {
    sri: { algorithm: "sha256" },
  },
  async headers() {
    const staticCsp = buildStaticCsp();
    return [
      {
        source: "/",
        headers: [{ key: "Content-Security-Policy", value: staticCsp }],
      },
      {
        source: "/c/:path*",
        headers: [{ key: "Content-Security-Policy", value: staticCsp }],
      },
      {
        source: "/p/:path*",
        headers: [{ key: "Content-Security-Policy", value: staticCsp }],
      },
    ];
  },
};

export default nextConfig;
