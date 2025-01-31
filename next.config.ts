import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["*"], // Allow images from any URL
  },
};

export default nextConfig;
