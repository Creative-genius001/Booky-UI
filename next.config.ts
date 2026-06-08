import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  async rewrites() {
    // Proxy API calls in development to avoid CORS. Configure NEXT_PUBLIC_API_BASE_URL
    // for production where the backend is served from its own origin.
    const target = process.env.API_PROXY_TARGET;
    if (!target) return [];
    return [{ source: "/api/backend/:path*", destination: `${target}/:path*` }];
  },
};

export default nextConfig;
