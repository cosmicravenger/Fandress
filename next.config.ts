import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Direct links: <Image> renders the Shopify CDN URL as-is, with no /_next/image proxy.
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 828, 1080, 1200, 1600],
    imageSizes: [64, 120, 240, 384, 512],
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com", pathname: "/**" },
      { protocol: "https", hostname: "fandress.com", pathname: "/**" },
    ],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
