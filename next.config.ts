import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${(process.env.BACKEND_URL || "https://issue-management-backend.onrender.com").replace(/\/$/, '')}/:path*`,
      },
    ];
  },
};

export default nextConfig;
