import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const rootDir = process.cwd();
const apiDir = path.join(rootDir, "src", "app", "api");
const tempApiDir = path.join(rootDir, "src", "app", "_api_server");
const middlewarePath = path.join(rootDir, "src", "middleware.ts");
const tempMiddlewarePath = path.join(rootDir, "src", "_middleware.ts.bak");
const outDir = path.join(rootDir, "out");

let apiMoved = false;
let middlewareMoved = false;

try {
  if (fs.existsSync(apiDir)) {
    console.log("Temporarily opting API routes out of static routing during export...");
    fs.renameSync(apiDir, tempApiDir);
    apiMoved = true;
  }
  if (fs.existsSync(middlewarePath)) {
    console.log("Temporarily opting middleware out of static routing during export...");
    fs.renameSync(middlewarePath, tempMiddlewarePath);
    middlewareMoved = true;
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
  if (apiMoved && fs.existsSync(tempApiDir)) {
    console.log("Restoring src/app/api route handlers...");
    fs.renameSync(tempApiDir, apiDir);
  }
  if (middlewareMoved && fs.existsSync(tempMiddlewarePath)) {
    console.log("Restoring src/middleware.ts...");
    fs.renameSync(tempMiddlewarePath, middlewarePath);
  }
}
