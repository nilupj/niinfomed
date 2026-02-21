/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  reactStrictMode: true,

  images: {
    // Cloudflare Workers par Next server chalane ke liye 
    // default image optimization aksar fail ho jati hai.
    unoptimized: process.env.NODE_ENV === 'production', 

    remotePatterns: [
      // =========================
      // Production CMS (niinfomed)
      // =========================
      {
        protocol: "https",
        hostname: "api.niinfomed.com", // Aapka Django API production domain
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "niinfomed.com",
        pathname: "/media/**",
      },

      // =========================
      // Local Development Patterns
      // =========================
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

      // =========================
      // External
      // =========================
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },

  async rewrites() {
    // Cloudflare environment variables se URL uthayega, 
    // nahi to local development wala use karega.
    const CMS_URL =
      process.env.NEXT_PUBLIC_CMS_API_URL || "http://localhost:8001";

    return [
      // ✅ Django API (namespaced)
      {
        source: "/cms-api/:path*",
        destination: `${CMS_URL}/api/:path*`,
      },

      // ✅ Media
      {
        source: "/media/:path*",
        destination: `${CMS_URL}/media/:path*`,
      },
      {
        source: "/cms-media/:path*",
        destination: `${CMS_URL}/media/:path*`,
      },
    ];
  },
};

// Sentry configuration for Cloudflare/Edge
module.exports = withSentryConfig(nextConfig, {
  silent: true,
  // Cloudflare Workers ke liye zaroori settings:
  hideSourceMaps: true,
  widenClientFileUpload: true,
});