/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // If you need custom webpack config
  webpack: (config) => {
    // Add aliases to webpack config
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src')
    };
    return config;
  },
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

module.exports = nextConfig;