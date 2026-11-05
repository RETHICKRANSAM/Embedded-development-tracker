import type { NextConfig } from "next";

const basePath = "/Embedded-development-tracker";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: "/Embedded-development-tracker/",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
