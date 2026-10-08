import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import uploadRouter from "./upload.js";
import stateRouter from "./state.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(uploadRouter);
router.use(stateRouter);

export default router;
