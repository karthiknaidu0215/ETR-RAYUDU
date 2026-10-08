import { Router, type IRouter, type Request, type Response } from "express";
import { type HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/healthz", (_req: Request, res: Response<HealthCheckResponse>) => {
  res.json({ status: "ok" });
});

router.get("/health", (_req: Request, res: Response<HealthCheckResponse>) => {
  res.json({ status: "ok" });
});

export default router;
