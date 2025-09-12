// const { Schema, model } = require("mongoose");
import { Schema, model, Document } from "mongoose";

export interface IComment extends Document {
  creator: Schema.Types.ObjectId; // reference to the User who created the comment
  timelineItem: Schema.Types.ObjectId; // the TimelineItem this comment belongs to
  title?: string; // optional short title
  content: string; // main body of the comment
  parentId?: Schema.Types.ObjectId; //To support threaded/reply comments
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    timelineItem: { type: Schema.Types.ObjectId, ref: "TimelineItem", required: true },
    title: { type: String },
    content: { type: String, required: true, trim: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Comment" },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Comment = model<IComment>("Comment", commentSchema);

// module.exports = Comment;
export default Comment;
