import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const rootDir = process.cwd();
const apiDir = path.join(rootDir, "src", "app", "api");
const tempApiDir = path.join(rootDir, "src", "app", "_api_server");
const outDir = path.join(rootDir, "out");

let moved = false;

try {
  if (fs.existsSync(apiDir)) {
    console.log("Temporarily opting API routes out of static routing during export...");
    fs.renameSync(apiDir, tempApiDir);
    moved = true;
  }

  console.log("Running Next.js static export build...");
  execSync("npx next build", {
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_EXPORT: "true",
      NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH || "/Embedded-development-tracker",
    },
  });

  // Ensure .nojekyll exists in out/ so GitHub Pages serves _next/ assets properly
  if (fs.existsSync(outDir)) {
    fs.writeFileSync(path.join(outDir, ".nojekyll"), "");
    console.log("Created out/.nojekyll for GitHub Pages asset compatibility.");
  }
} finally {
  if (moved && fs.existsSync(tempApiDir)) {
    console.log("Restoring src/app/api route handlers...");
    fs.renameSync(tempApiDir, apiDir);
  }
}
