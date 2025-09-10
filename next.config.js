const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
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
