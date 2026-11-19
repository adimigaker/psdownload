import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/sitemap.xml",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/xml" },
        ],
      },
      {
        source: "/robots.txt",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
          { key: "Content-Type", value: "text/plain" },
        ],
      },
    ];
  },
};

export default nextConfig;