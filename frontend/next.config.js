/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  reactStrictMode: true,

  images: {
    // Cloudflare Workers par Next server chalane ke liye 
    // default image optimization aksar fail ho jati hai.
    unoptimized: true, // Always true for Cloudflare deployment
    
    remotePatterns: [
      // =========================
      // Oracle Production CMS (161.118.167.107)
      // =========================
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
      
      // =========================
      // Production CMS (niinfomed) - if you have domain
      // =========================
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
      {
        protocol: "http",
        hostname: "127.0.0.1",
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
      {
        protocol: "https",
        hostname: "*.unsplash.com",
        pathname: "/**",
      },
    ],
  },

  // Add trailing slash handling
  trailingSlash: false,
  
  // Enable SWC minification for better performance
  swcMinify: true,

  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  async rewrites() {
    // Cloudflare environment variables se URL uthayega, 
    // nahi to Oracle CMS use karega.
    const CMS_URL = process.env.NEXT_PUBLIC_CMS_API_URL || "http://161.118.167.107";
    
    // Clean URL (remove trailing slash)
    const cleanCMSUrl = CMS_URL.replace(/\/$/, '');

    console.log('🔧 Configuring rewrites with CMS URL:', cleanCMSUrl);

    return [
      // ✅ Django API (namespaced)
      {
        source: "/cms-api/:path*",
        destination: `${cleanCMSUrl}/api/:path*`,
      },
      
      // ✅ Direct API access (for backward compatibility)
      {
        source: "/api/:path*",
        destination: `${cleanCMSUrl}/api/:path*`,
      },

      // ✅ Media files
      {
        source: "/media/:path*",
        destination: `${cleanCMSUrl}/media/:path*`,
      },
      {
        source: "/cms-media/:path*",
        destination: `${cleanCMSUrl}/media/:path*`,
      },
      
      // ✅ Documents
      {
        source: "/documents/:path*",
        destination: `${cleanCMSUrl}/documents/:path*`,
      },
      
      // ✅ Wagtail API v2 (if needed)
      {
        source: "/api/v2/:path*",
        destination: `${cleanCMSUrl}/api/v2/:path*`,
      },
    ];
  },

  // Add headers for CORS and security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/cms-api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  // Webpack configuration for Cloudflare
  webpack: (config, { isServer }) => {
    // Cloudflare Workers don't support Node.js modules
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

// Sentry configuration for Cloudflare/Edge
const sentryConfig = {
  silent: true,
  // Cloudflare Workers ke liye zaroori settings:
  hideSourceMaps: true,
  widenClientFileUpload: true,
  disableLogger: true,
  // Automatically tree-shake Sentry logger statements
  transpileClientSDK: true,
};

module.exports = withSentryConfig(nextConfig, sentryConfig);