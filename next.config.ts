import type { NextConfig } from "next";
import path from "path";

const nextRouterCompatPath = "./components/router/nextRouterCompat.tsx";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  experimental: {
    scrollRestoration: true,
  },

  turbopack: {
    resolveAlias: {
      "react-router-dom": nextRouterCompatPath,
    },
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "react-router-dom": path.resolve(__dirname, nextRouterCompatPath),
    };
    return config;
  },
};

export default nextConfig;
