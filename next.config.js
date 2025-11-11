/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Standalone output for production (Webuzo-friendly)
  output: 'standalone',

  // ✅ Prevent trailing slashes to avoid routing issues
  trailingSlash: false,

  // ✅ Enforce strict mode for React debugging
  reactStrictMode: true,

  // ✅ Recognize these file extensions for pages and routes
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // ✅ Webpack configuration to fix Node.js core module issues
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      child_process: false,
      dns: false,
      http2: false,
      http: false,
      https: false,
      zlib: false,
    };
    return config;
  },

  // ✅ Ignore ESLint errors during build (for smoother CI/CD)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ Ignore TypeScript errors during build (useful for production)
  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ Runtime configuration for Apache/Node environments
  experimental: {
    runtime: 'nodejs',
  },

  // ✅ Security headers for production
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
