import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { pinoHttp } from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: Request) {
        return {
          id: (req as Request & { id?: unknown }).id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: Response) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// 1. API routes mounted under /api
app.use("/api", router);

// 2. Health check endpoints at root level (/healthz and /health)
app.use(router);

// 3. Static frontend assets from Vite dist
const currentDir =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

const candidateDirs = [
  path.resolve(process.cwd(), "artifacts/one-acre-land/dist"),
  path.resolve(process.cwd(), "../one-acre-land/dist"),
  path.resolve(process.cwd(), "../../artifacts/one-acre-land/dist"),
  path.resolve(currentDir, "../../one-acre-land/dist"),
  path.resolve(currentDir, "../../../artifacts/one-acre-land/dist"),
  path.resolve("/app/applet/artifacts/one-acre-land/dist"),
  path.resolve("/artifacts/one-acre-land/dist"),
];

const staticDir = candidateDirs.find((dir) =>
  fs.existsSync(path.join(dir, "index.html")),
);

if (staticDir) {
  logger.info({ staticDir }, "Serving static frontend assets");

  // Serve static assets with index: false so "/" is handled explicitly
  app.use(express.static(staticDir, { index: false }));

  // Root route explicitly serves the React application entry
  app.get("/", (_req: Request, res: Response) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });

  // SPA fallback for all other client-side GET routes
  app.use((req: Request, res: Response, next) => {
    if ((req.method !== "GET" && req.method !== "HEAD") || req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(staticDir, "index.html"));
  });
} else {
  logger.warn(
    "Frontend static directory not found among candidates: %o",
    candidateDirs,
  );
  app.get("/", (_req: Request, res: Response) => {
    res
      .status(503)
      .send("Frontend build not ready. Please run 'npm run build' first.");
  });
}

export default app;
