import { Request, Response, NextFunction, Router } from 'express';
import validateToken from '../middlewares/auth.middleware';
import authRouter from "../routes/auth.routes"
import timelineRouter from "../routes/Timeline.routes"
import uploadRouter from "../routes/upload.routes"
// const uploadRoutes = require("./upload.routes");

const router = Router();

// ℹ️ Test Route. Can be left and used for waking up the server if idle
router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json("All good in here");
});

router.use("/auth", authRouter)
router.use("/timelines", validateToken, timelineRouter);
router.use("/upload", validateToken, uploadRouter);

// module.exports = indexRouter;
export default router