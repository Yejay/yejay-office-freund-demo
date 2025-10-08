import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable static optimization for Clerk authentication
  output: process.env.BUILD_STANDALONE ? 'standalone' : undefined,
};

export default nextConfig;
