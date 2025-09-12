import { Request } from "express";
import mongoose from "mongoose";
import User from "../models/User.model";
import { JwtPayload } from "../types/auth";

// Returns the User id in req.payload or null if not found/invalid
export default async function getUserIdFromPayload(req: Request) {
  if (!req.payload) return null;

  const payload = req.payload as JwtPayload;
  const userId = payload._id;
  if (!userId) return null;

  if (!mongoose.isValidObjectId(userId)) return null;

//   const user = await User.findById(userId).select("-password");
  return userId;
}
