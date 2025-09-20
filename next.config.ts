import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // ✅ Ignore TS errors in production builds
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
