import { Router, type IRouter } from "express";
import healthRouter from "./health";
import chatRouter from "./chat";
import convergiaRouter from "./convergia";
import { createGatewayRouter } from "../gateway";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chatRouter);
router.use(convergiaRouter);
router.use(createGatewayRouter());

export default router;