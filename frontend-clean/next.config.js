const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
    NEXT_PUBLIC_SOCKET_URL:
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000",
  },

  // Image optimization settings
  images: {
    unoptimized: true,
  },

  // Fix chunk loading issues
  webpack: (config, { dev, isServer }) => {
    if (!isServer && dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },

  // Don't generate static pages that have issues
  staticPageGenerationTimeout: 0,
};

module.exports = nextConfig;
