#!/usr/bin/env node
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bundlePath = path.resolve(__dirname, "artifacts/api-server/dist/index.mjs");

if (!fs.existsSync(bundlePath)) {
  const { execSync } = await import("node:child_process");
  console.log("Building production API server bundle...");
  execSync("npm run build --workspace=@workspace/api-server", {
    cwd: __dirname,
    stdio: "inherit",
  });
}

await import(bundlePath);
