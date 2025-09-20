import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // ✅ Ignore TS errors in production builds
    ignoreBuildErrors: true,
  },
  eslint: {
    // ✅ Ignores ESLint errors during builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
