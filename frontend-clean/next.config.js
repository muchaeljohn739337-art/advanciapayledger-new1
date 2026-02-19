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

  // URL redirects for convenience
  async redirects() {
    return [
      {
        source: '/register',
        destination: '/auth/register',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/auth/register',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
