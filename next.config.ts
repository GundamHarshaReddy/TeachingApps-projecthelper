import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Add compiler options to suppress the hydration errors
  compiler: {
    // Recommended for hydration errors in production
    styledComponents: true,
  },
  // Add experimental options for hydration error handling
  experimental: {
    // This will help React be more forgiving of hydration mismatches
    optimizeCss: true,
  },
};

export default nextConfig;
