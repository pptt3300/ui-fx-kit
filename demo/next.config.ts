import type { NextConfig } from "next";
import path from "path";

const rootDir = path.resolve(__dirname, "..");

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NODE_ENV === "production" ? "/ui-fx-kit" : "",
  images: { unoptimized: true },
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: rootDir,
    resolveAlias: {
      "@effects": path.join(rootDir, "effects"),
      "@hooks": path.join(rootDir, "hooks"),
      "@css": path.join(rootDir, "css"),
      "@presets": path.join(rootDir, "presets"),
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@effects": path.join(rootDir, "effects"),
      "@hooks": path.join(rootDir, "hooks"),
      "@css": path.join(rootDir, "css"),
      "@presets": path.join(rootDir, "presets"),
    };
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      rootDir,
      path.join(__dirname, "node_modules"),
      path.join(rootDir, "node_modules"),
      "node_modules",
    ];
    return config;
  },
};

export default nextConfig;
