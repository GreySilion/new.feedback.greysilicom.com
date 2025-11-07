/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Use standalone build (for Webuzo + Apache deployment)
  output: 'standalone',

  // ✅ Disable trailing slashes to avoid route mismatches
  trailingSlash: false,

  // ✅ Enable React strict mode for development hygiene
  reactStrictMode: true,

  // ✅ File extensions supported for pages and routes
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // ✅ Webpack configuration (prevents server build errors)
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

  // ✅ Skip lint and TS errors during production build
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // ✅ Security headers
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
