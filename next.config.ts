import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/climbing',
  assetPrefix: '/climbing',
  images: {
    unoptimized: true,
  },
};

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  workboxOptions: {
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
          }
        }
      },
      {
        urlPattern: /\.(?:js|css|html|json)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-resources',
        }
      }
    ]
  }
});

export default withPWA(nextConfig);
