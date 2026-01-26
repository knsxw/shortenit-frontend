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
      },
      {
        source: "/oauth2/success.html",
        destination: "/auth/callback",
      },
      {
        source: "/oauth2/:path*",
        destination: "https://shortenit.freaks.dev/oauth2/:path*",
      }
    ];
  },
};

export default nextConfig;
