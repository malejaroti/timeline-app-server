import { Request, Response, NextFunction, Router } from 'express';
import mongoose from "mongoose";
import Timeline from "../models/Timeline.model"
import TimelineItem from '../models/TimelineItem.model';
import { JwtPayload } from '../types/auth';
import getUserIdFromPayload from '../utils/getUserIdFromPayload';

const router = Router({ mergeParams: true }); 

//POST /api/timelines/:timelineId/items - Create a new timeline item
router.post("/items", async (req: Request, res: Response, next: NextFunction) => {

  if (!req.payload) return res.status(401).json({ errorMessage: "no payload" });
  const { _id: creator } = req.payload as JwtPayload;

  console.log("req.params",req.params)
  const {timelineId : timeline} = req.params
  let isApproved = false
  const foundTimeline = await Timeline.findById(timeline);
  if (foundTimeline !== null){
    if(foundTimeline.owner.toString() === creator){
      isApproved = true
    }else{
      isApproved = false
    }
  }

  console.log(req.body);
  const {title, kind, description, startDate, endDate, images, impact, tags} = req.body;

  // If no endDate is provided, use startDate (treat as a 1-day event)
  const finalEndDate = endDate?? startDate;

  try {
    const response = await TimelineItem.create({
        timeline, creator, title, kind, description, startDate, finalEndDate, images, impact, tags, isApproved
    });
    res.status(201).json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//GET /api/timelines/:timelineId/items - Get all of the itms of one timeline item
router.get("/items", async (req: Request, res: Response, next: NextFunction) => {
  if (!req.payload) return res.status(401).json({ errorMessage: "no payload" });
  const { _id: loggedUserId } = req.payload as JwtPayload;
  
  console.log("req.params", req.params);
  const { timelineId, itemId } = req.params;
  
  try {
    const foundTimeline = await Timeline.findById(timelineId);
    if (!foundTimeline) return res.status(404).json({ message: "Timeline not found" });
   
    // Check if timeline is public OR user is owner/collaborator/creator
    const isPublic = false; //foundTimeline.isPublic;
    const isTimelineOwner = foundTimeline.owner.toString() === loggedUserId;
    const isCollaborator = Array.isArray(foundTimeline.collaborators) && foundTimeline.collaborators.some((collab) => collab.toString() === loggedUserId.toString());
    
    if (isTimelineOwner || isCollaborator) {
      const response = await TimelineItem.find({timeline : timelineId});
      res.status(200).json(response);
    } else {
      return res.status(403).json({ errorMessage: "Access denied.User is neither timeline owner, nor creator of the item, nor timeline collaborator" });
    }
    
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//GET /api/timelines/:timelineId/items/:itemId - Get details of one timeline item
router.get("/items/:itemId", async (req: Request, res: Response, next: NextFunction) => {
  if (!req.payload) return res.status(401).json({ errorMessage: "no payload" });
  const { _id: loggedUserId } = req.payload as JwtPayload;
  
  console.log("req.params", req.params);
  const { timelineId, itemId } = req.params;
  
  try {
    const foundTimeline = await Timeline.findById(timelineId);
    if (!foundTimeline) return res.status(404).json({ message: "Timeline not found" });
    const foundTimelineItem = await TimelineItem.findById(itemId);
    if (!foundTimelineItem) return res.status(404).json({ message: "Timeline item not found" });
    
    // Check if timeline is public OR user is owner/collaborator/creator
    const isPublic = false; //foundTimeline.isPublic;
    const isTimelineOwner = foundTimeline.owner.toString() === loggedUserId;
    const isItemCreator = foundTimelineItem.creator.toString() === loggedUserId;
    const isCollaborator = Array.isArray(foundTimeline.collaborators) && foundTimeline.collaborators.some((collab) => collab.toString() === loggedUserId.toString());
    
    if (isTimelineOwner || isItemCreator || isCollaborator) {
      const response = await TimelineItem.findById(itemId);
      res.status(200).json(response);
    } else {
      return res.status(403).json({ errorMessage: "Access denied.User is neither timeline owner, nor creator of the item, nor timeline collaborator" });
    }
    
  } catch (error) {
    console.log(error);
    next(error);
  }
});



// PUT /api/timelines/:timelineId/items/:itemId - Edit a timeline item 
router.put("/items/:itemId", async (req: Request, res: Response, next: NextFunction) => {
  if (!req.payload) return res.status(401).json({ errorMessage: "no payload" });

  const { _id: loggedUserId } = req.payload as JwtPayload;
  const { timelineId, itemId } = req.params;
  
  // if (!mongoose.isValidObjectId(timelineId)) {
  //   return res.status(400).json({ message: "Invalid ObjectId format for TimelineId" });
  // }
  try {
    const foundTimeline = await Timeline.findById(timelineId);
    if (!foundTimeline) return res.status(404).json({ message: "Timeline not found" });
    const foundTimelineItem = await TimelineItem.findById(itemId);
    if (!foundTimelineItem) return res.status(404).json({ message: "Timeline item not found" });
    
    // Check if timeline is public OR user is owner/collaborator/creator
    const isPublic = false; //foundTimeline.isPublic;
    const isTimelineOwner = foundTimeline.owner.toString() === loggedUserId;
    const isItemCreator = foundTimelineItem.creator.toString() === loggedUserId;
    const isCollaborator = Array.isArray(foundTimeline.collaborators) && 
    foundTimeline.collaborators.some(
      (collab) => collab.toString() === loggedUserId.toString());
      
      if (isTimelineOwner || isItemCreator || isCollaborator) {
        const { title, description, startDate, endDate, images, impact, tags } = req.body;
        const updates: any = {};
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (startDate !== undefined) updates.startDate = startDate;
        if (endDate !== undefined) updates.endDate = endDate;
        if (images !== undefined) updates.images = images;
        if (tags !== undefined) updates.tags = tags;
    
        const response = await TimelineItem.findByIdAndUpdate(
          itemId,
          { $set: updates },
          { new: true }
        );
        res.status(200).json(response);
    } else {
      return res.status(403).json({ errorMessage: "Edit access denied. User is neither timeline owner, nor creator of the item, nor timeline collaborator" });
    } 

  } catch (error) {
    console.log(error);
    next(error);
  }
});

// DELETE /api/timelines/:timelineId/items/:itemId - Remove a timeline item
router.delete("/items/:itemId", async (req: Request, res: Response, next: NextFunction) => {
  const { _id: userId } = req.payload as JwtPayload;
  const {timelineId, itemId} = req.params

  const foundTimeline = await Timeline.findById(timelineId);
  const foundTimelineItem = await TimelineItem.findById(itemId);
  if (foundTimeline === null ){
    return res.json({errMsg: "Timeline does not exist"});
  }
  if (foundTimelineItem === null ){
    return res.json({errMsg: "Timeline item does not exist"});
  }

  //if user is owner of the timeline or creator of the item, it can delete it, otherwise not
  if(foundTimeline.owner.toString() === userId || foundTimelineItem.creator.toString() === userId){
    try {
      const response = await TimelineItem.findByIdAndDelete(itemId,
        { new: true } // return the deleted item
      );
      res.status(200).json(response); //* 200 Ok
  
    } catch (error) {
      console.log(error);
      next(error);
    }
  }else{
    return res.json({errMsg: "User is neither creator of the item, nor owner of the timeline. Permission to delete denied"});
  }

});

// module.exports = router
const timelineItemRouter = router
export default timelineItemRouter