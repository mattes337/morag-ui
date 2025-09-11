const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  
  // Security headers
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    
    return [
      {
        source: '/(.*)',
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
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=(), fullscreen=(self), picture-in-picture=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: isDev ? '' : 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: isDev 
              ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' localhost:* 127.0.0.1:*; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' ws: wss: localhost:* 127.0.0.1:*; media-src 'self'; object-src 'none'; child-src 'none'; frame-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
              : "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; media-src 'self'; object-src 'none'; child-src 'none'; frame-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests",
          },
        ].filter(header => header.value !== ''), // Remove empty headers in dev
      },
    ];
  },
  
  // Bundle optimization - disabled for debugging
  // experimental: {
  //   optimizePackageImports: [
  //     '@radix-ui/react-dialog',
  //     '@radix-ui/react-select',
  //     '@radix-ui/react-tabs',
  //     '@radix-ui/react-toast',
  //     '@radix-ui/react-collapsible',
  //     'lucide-react',
  //   ],
  // },
  
  // Simplified webpack config
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;
