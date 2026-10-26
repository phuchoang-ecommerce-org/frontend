import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  logging: {
    serverFunctions: false,
  },
  experimental: {
    agentFeedback: true,
  },
};

export default nextConfig;
