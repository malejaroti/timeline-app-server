import { Request, Response, NextFunction, Router } from 'express';
import validateToken from '../middlewares/auth.middleware';
import timelineRouter from "../routes/Timeline.routes"
import authRouter from "../routes/auth.routes"

// const timelineRouter = require("./Timeline.routes") 
// const authRouter = require("./auth.routes")


const router = Router();
// import router as timelineRouter from "./Timeline.routes"
// import timelineItemRouter from "./TimelineItem.routes"


// ℹ️ Test Route. Can be left and used for waking up the server if idle
router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json("All good in here");
});

router.use("/auth", authRouter)
router.use("/timelines", validateToken, timelineRouter);
// router.use("/timelineItem", timelineItemRouter);

// module.exports = indexRouter;
export default router