// next.config.js
/** @type {import('next').NextConfig} */

const nextConfig = {
  output: "standalone",
  reactStrictMode: true,

  // Generate consistent build ID
  generateBuildId: async () => {
    return process.env.BUILD_ID || `build-${Date.now()}`;
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.niinfomed.com",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "api.niinfomed.com",
        pathname: "/api/**",
      },
      {
        protocol: "http",
        hostname: "api.niinfomed.com",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "niinfomed.com",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8001",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8001",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },

  trailingSlash: false,
  staticPageGenerationTimeout: 120,
  skipTrailingSlashRedirect: true,

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  async rewrites() {
    const CMS_URL = process.env.NEXT_PUBLIC_CMS_API_URL || "https://api.niinfomed.com";
    const cleanCMSUrl = CMS_URL.replace(/\/$/, "");

    return [
      {
        source: "/cms-api/:path*",
        destination: `${cleanCMSUrl}/api/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${cleanCMSUrl}/api/:path*`,
      },
      {
        source: "/media/:path*",
        destination: `${cleanCMSUrl}/media/:path*`,
      },
      {
        source: "/cms-media/:path*",
        destination: `${cleanCMSUrl}/media/:path*`,
      },
      {
        source: "/documents/:path*",
        destination: `${cleanCMSUrl}/documents/:path*`,
      },
      {
        source: "/api/v2/:path*",
        destination: `${cleanCMSUrl}/api/v2/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/cms-api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
      {
        source: "/_next/data/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
