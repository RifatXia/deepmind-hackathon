import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  // PWA support will be added via next-pwa when deploying
  // For now, keeping config simple for Vercel deployment
};

export default nextConfig;
