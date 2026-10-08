#!/usr/bin/env node
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bundlePath = path.resolve(__dirname, "artifacts/api-server/dist/index.mjs");
const frontendDist = path.resolve(__dirname, "artifacts/one-acre-land/dist/index.html");

const { execSync } = await import("node:child_process");

if (!fs.existsSync(frontendDist)) {
  console.log("Building frontend production bundle...");
  execSync("npm run build --workspace=@workspace/one-acre-land", {
    cwd: __dirname,
    stdio: "inherit",
  });
}

if (!fs.existsSync(bundlePath)) {
  console.log("Building production API server bundle...");
  execSync("npm run build --workspace=@workspace/api-server", {
    cwd: __dirname,
    stdio: "inherit",
  });
}

await import(bundlePath);
