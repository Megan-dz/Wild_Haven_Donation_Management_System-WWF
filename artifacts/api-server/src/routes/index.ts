import { Router, type IRouter } from "express";
import healthRouter from "./health";
import donationsRouter from "./donations";
import campaignsRouter from "./campaigns";
import donorsRouter from "./donors";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(donationsRouter);
router.use(campaignsRouter);
router.use(donorsRouter);
router.use(dashboardRouter);

export default router;
