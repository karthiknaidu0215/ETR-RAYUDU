import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);
app.use(router);

// Serve static frontend assets from Vite dist when available
const candidateDirs = [
  path.resolve(process.cwd(), "artifacts/one-acre-land/dist"),
  path.resolve(process.cwd(), "../one-acre-land/dist"),
  path.resolve(process.cwd(), "../../artifacts/one-acre-land/dist"),
];

const staticDir = candidateDirs.find((dir) => fs.existsSync(dir));

if (staticDir) {
  app.use(express.static(staticDir));
  // Express 5 compatible SPA fallback handler (no path-to-regexp wildcard syntax)
  app.use((req: Request, res: Response, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(staticDir, "index.html"));
  });
}

export default app;
