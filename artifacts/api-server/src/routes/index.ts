import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import subscriptionsRouter from "./subscriptions";
import scoresRouter from "./scores";
import charitiesRouter from "./charities";
import drawsRouter from "./draws";
import winnersRouter from "./winners";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(subscriptionsRouter);
router.use(scoresRouter);
router.use(charitiesRouter);
router.use(drawsRouter);
router.use(winnersRouter);
router.use(adminRouter);

export default router;
