import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profilesRouter from "./profiles";
import reportsRouter from "./reports";
import walletRouter from "./wallet";
import trainingRouter from "./training";
import scrapRouter from "./scrap";
import donationsRouter from "./donations";
import eventsRouter from "./events";
import feedRouter from "./feed";
import notificationsRouter from "./notifications";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";
import classifyRouter from "./classify";
import dustbinRouter from "./dustbin";
import urgentNeedsRouter from "./urgentNeeds";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(profilesRouter);
router.use(reportsRouter);
router.use(walletRouter);
router.use(trainingRouter);
router.use(scrapRouter);
router.use(donationsRouter);
router.use(eventsRouter);
router.use(feedRouter);
router.use(notificationsRouter);
router.use(dashboardRouter);
router.use(adminRouter);
router.use(classifyRouter);
router.use(dustbinRouter);
router.use(urgentNeedsRouter);

// Global error handler
router.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(status).json({ error: message });
});

export default router;
