import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://shortenit.freaks.dev/api/:path*",
      },
      {
        source: "/s/:path*",
        destination: "https://shortenit.freaks.dev/s/:path*",
      }
    ];
  },
};

export default nextConfig;
