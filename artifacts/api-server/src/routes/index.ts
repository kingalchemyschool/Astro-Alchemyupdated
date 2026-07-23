import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import chartsRouter from "./charts.js";
import premiumRouter from "./premium.js";
import stripeRouter from "./stripe.js";
import labRouter from "./lab.js";
import dailyForgeRouter from "./dailyForge.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chartsRouter);
router.use(premiumRouter);
router.use(stripeRouter);
router.use(labRouter);
router.use(dailyForgeRouter);

export default router;
