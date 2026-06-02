import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Vercel
  output: 'standalone',

  // Configure external packages for server components
  serverExternalPackages: ['@napi-rs/canvas'],
};

export default nextConfig;
