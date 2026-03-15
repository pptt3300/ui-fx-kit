import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@effects": path.resolve(__dirname, "../effects"),
      "@hooks": path.resolve(__dirname, "../hooks"),
      "@css": path.resolve(__dirname, "../css"),
      "@presets": path.resolve(__dirname, "../presets"),
    };
    return config;
  },
};

export default nextConfig;
