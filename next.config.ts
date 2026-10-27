import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75],
    remotePatterns: [
      new URL("https://cdn.ecp.example/**"),
      new URL("http://example.com/**"),
    ],
  },
  logging: {
    serverFunctions: false,
  },
  experimental: {
    agentFeedback: true,
  },
};

export default nextConfig;
