import { Router, type IRouter } from "express";
import healthRouter from "./health";
import chatRouter from "./chat";
import convergiaRouter from "./convergia";
import contextRouter from "./context";
import { createGatewayRouter } from "../gateway";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chatRouter);
router.use(convergiaRouter);
router.use(contextRouter);
router.use(createGatewayRouter());

export default router;