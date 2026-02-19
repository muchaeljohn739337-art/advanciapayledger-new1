const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,

  typescript: {
    ignoreBuildErrors: true,
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
};

module.exports = nextConfig;
