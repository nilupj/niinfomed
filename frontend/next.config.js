/** @type {import('next').NextConfig} */

const nextConfig = {
  output: "standalone",   // ⭐ REQUIRED for OpenNext + Cloudflare

  reactStrictMode: true,

  images: {
    unoptimized: true,

    remotePatterns: [
      {
        protocol: "http",
        hostname: "161.118.167.107",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "161.118.167.107",
        pathname: "/api/**",
      },
      {
        protocol: "https",
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
        hostname: "192.168.31.238",
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
      {
        protocol: "https",
        hostname: "*.unsplash.com",
        pathname: "/**",
      },
    ],
  },

  trailingSlash: false,

  swcMinify: true,

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  async rewrites() {
    const CMS_URL =
      process.env.NEXT_PUBLIC_CMS_API_URL || "http://161.118.167.107";

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
