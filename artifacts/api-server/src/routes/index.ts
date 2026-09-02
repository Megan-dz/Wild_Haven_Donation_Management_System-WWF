import { Router, type IRouter } from "express";
import healthRouter from "./health";
import portalRouter from "./portal";

const router: IRouter = Router();

router.use(healthRouter);
router.use(portalRouter);

export default router;
