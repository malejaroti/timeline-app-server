import { Request, Response, NextFunction, Router } from 'express';
import mongoose from "mongoose";
import Timeline from "../models/Timeline.model"
import TimelineItem from '../models/TimelineItem.model';
import timelineItemRouter from "../routes/TimelineItem.routes"

import { JwtPayload } from '../types/auth';
import getUserIdFromPayload from '../utils/getUserIdFromPayload';

const router = Router()


//POST /api/timelines - Create a new timeline
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  if (!req.payload) return res.status(401).json({ errorMessage: "no payload" });
  const { _id: owner } = req.payload as JwtPayload;

  console.log(req.body);
  const {title, icon, description, isPublic, color } = req.body;
  try {
    const response = await Timeline.create({
        owner, title, icon, description, isPublic, color
    });
    res.status(201).json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//GET /api/timelines - Get all the timelines that belong to a user
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  if (!req.payload) return res.status(401).json({ errorMessage: "no payload" });
  const { _id: owner } = req.payload as JwtPayload;  
  
  console.log(req.body);
  const {title, icon, description, isPublic, color } = req.body;
  try {
    const response = await Timeline.find({owner});
    res.status(201).json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
});


//GET /api/timelines/collaborations - Get all timelines where logged user is a collaborator
router.get("/collaborations", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.payload) return res.status(401).json({ errorMessage: "no payload" });
    const { _id: userId } = req.payload as JwtPayload;
    const response = await Timeline.find(
      {collaborators: userId }
    ).select("title");
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//GET /api/timelines/:timelineId - Get details of one timeline
router.get("/:timelineId", async (req: Request, res: Response, next: NextFunction) => {
  const {timelineId} = req.params

  try {
    const response = await Timeline.findById(timelineId);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
});


// DELETE api/timelines/:timelineId/ - Remove a timeline
router.delete("/:timelineId", async (req: Request, res: Response, next: NextFunction) => {
  const ownerId = getUserIdFromPayload(req)
  const {timelineId} = req.params

  if (!mongoose.isValidObjectId(timelineId)) {
    return res.status(400).json({ message: "Invalid ObjectId format for TimelineId" });
  }
  try {
    const response = await Timeline.findByIdAndDelete(timelineId, 
      { new: true } // return the deleted document
    );

    const response2 = await TimelineItem.deleteMany({ timeline: timelineId});
    
    res.status(200).json(response2); //* 200 Ok

  } catch (error) {
    console.log(error);
    next(error);
  }
});

//POST api/timelines/:timelineId/collaborators - Add a collaborator to a timeline
router.post("/:timelineId/collaborators", async (req: Request, res: Response, next: NextFunction) => {
  if (!req.payload) return res.status(401).json({ errorMessage: "no payload" });
  const { _id: owner } = req.payload as JwtPayload;  
  
  const {timelineId} = req.params
  const {_id: newCollaboratorId} = req.body

  if (!mongoose.isValidObjectId(timelineId)) {
    return res.status(400).json({ message: "Invalid ObjectId format for TimelineId" });
  }
  if (!mongoose.isValidObjectId(newCollaboratorId)) {
    return res.status(400).json({ message: "Invalid ObjectId format for UserId of collaborator" });
  }
  try {
    const response = await Timeline.findByIdAndUpdate(timelineId, 
      { $addToSet: { collaborators: newCollaboratorId } },
      { new: true } // return the updated document
    ).populate("collaborators", "username"); // optional to populate user details

    res.status(200).json(response); //* 200 Ok
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// DELETE api/timelines/:timelineId/collaborators/:userId - Remove a collaborator from a timeline
router.delete("/:timelineId/collaborators/:userId", async (req: Request, res: Response, next: NextFunction) => {
  if (!req.payload) return res.status(401).json({ errorMessage: "no payload" });
  // const { _id: owner } = req.payload as JwtPayload;  
  const ownerId = getUserIdFromPayload(req)
  
  const {timelineId, userId: collaboratorId} = req.params

  if (!mongoose.isValidObjectId(timelineId)) {
    return res.status(400).json({ message: "Invalid ObjectId format for TimelineId" });
  }
  if (!mongoose.isValidObjectId(collaboratorId)) {
    return res.status(400).json({ message: "Invalid ObjectId format for UserId of collaborator" });
  }
  try {
    const response = await Timeline.findByIdAndUpdate(timelineId, 
      { $pull: { collaborators: collaboratorId } },
      { new: true } // return the updated document
    ).populate("collaborators", "username"); // optional to populate user details

    res.status(200).json(response); //* 200 Ok
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// PUT api/timelines/:timelineId - Edit a timeline (all fields except collaborators)
router.put("/:timelineId", async (req: Request, res: Response, next: NextFunction) => {
  if (!req.payload) return res.status(401).json({ errorMessage: "no payload" });

  const { _id: owner } = req.payload as JwtPayload;
  const { timelineId } = req.params;
  const { title, icon, description, isPublic, color } = req.body;

  if (!mongoose.isValidObjectId(timelineId)) {
    return res.status(400).json({ message: "Invalid ObjectId format for TimelineId" });
  }

  try {
    const foundTimeline = await Timeline.findById(timelineId);
    if (!foundTimeline) return res.status(404).json({ message: "Timeline not found" });

    // only owner can update
    if (foundTimeline.owner.toString() !== owner.toString()) {
      return res.status(403).json({ message: "User is not the timeline owner" });
    }

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (icon !== undefined) updates.icon = icon;
    if (description !== undefined) updates.description = description;
    if (isPublic !== undefined) updates.isPublic = isPublic;
    if (color !== undefined) updates.color = color;

    const response = await Timeline.findByIdAndUpdate(
      timelineId,
      { $set: updates },
      { new: true }
    );

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
});
router.use("/:timelineId", timelineItemRouter);

// module.exports = router
const timelineRouter = router
export default timelineRouter