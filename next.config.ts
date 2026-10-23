import type { NextConfig } from "next";

const isExport = process.env.NEXT_EXPORT === "true";
const basePath =
  process.env.NEXT_PUBLIC_BASE_PATH ??
  (process.env.GITHUB_ACTIONS ? "/Embedded-development-tracker" : "");

const nextConfig: NextConfig = {
  output: isExport ? "export" : undefined,
  basePath: basePath || undefined,
  trailingSlash: isExport,
  images: {
    unoptimized: isExport,
  },
};

export default nextConfig;
