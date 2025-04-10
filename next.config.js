/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // If you need custom webpack config
  webpack: (config, { isServer }) => {
    // Add aliases to webpack config
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src')
    };

    // Allow WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Handle esbuild-wasm in a browser environment
    if (!isServer) {
      // Prevent bundling of certain imported modules in esbuild
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        child_process: false,
        net: false,
        tls: false,
        'esbuild': false,
      };

      // Make sure Next.js uses esbuild-wasm directly
      config.resolve.alias['esbuild-wasm'] = 'esbuild-wasm';

      // Exclude esbuild from being processed by Next.js
      config.module.rules.push({
        test: /[\\/]node_modules[\\/]esbuild-wasm[\\/]/,
        use: 'null-loader',
      });
      
      // Add a rule for handling .wasm files
      config.module.rules.push({
        test: /\.wasm$/,
        type: 'asset/resource',
      });
    }
    
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
    // Add support for WebAssembly
    serverComponentsExternalPackages: ['esbuild-wasm'],
  },
};

module.exports = nextConfig;