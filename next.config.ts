import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fra.cloud.appwrite.io",
        pathname: "/v1/storage/**",
      },
    ],
  },
};

export default nextConfig;
