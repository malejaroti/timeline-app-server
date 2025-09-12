import { Schema, model, Document } from "mongoose";

export interface ITimelineItem extends Document {
  timeline: Schema.Types.ObjectId;
  creator: Schema.Types.ObjectId;
  kind: String;
  title: String;
  description?: String;
  startDate: Date;
  endDate?: Date;
  images?: [String]
  impact?: String;
  tags?: [String];
  isApproved?: Boolean,
  comments?: [Schema.Types.ObjectId],  
  createdAt: Date; // added automatically
  updatedAt: Date; // added automatically
}

const timelineItemSchema = new Schema<ITimelineItem>(
  {
    timeline: {
        type: Schema.Types.ObjectId,
        ref: "Timeline",
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: "Timeline",
        required: true
    },
    kind: { 
        type: String, 
        enum: ["event","person","book","movie","series","course"], 
        required: true,
        default: "event"
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      unique: true,
    },
    description: {
      type: String,
      required: false,
    },
    startDate: {
      type: Date,
      required: true, 
    },
    endDate: {
      type: Date,
      required: false, 
    },
    images: {
      type:[String],
      required: false,
    },
    impact: {
        type: String,
        enum: [
            "positive",   // 🚀 good outcome, motivating
            "negative",   // ⚠️ draining, distracting
            "neutral",    // ◽ just a fact / neither good nor bad
            "milestone",  // ⭐ big achievement / turning point
            "challenge",  // 💪 tough but growth-oriented
        ],
        default: "neutral"
    },
    tags: {
        type:[String],
        required: false
    },
    comments: {
      type:[Schema.Types.ObjectId],
      ref: "Comment",
      required: false
    },
    isApproved :{
      type: Boolean,
      required: false
    }
  },
  { timestamps: true } // adds createdAt / updatedAt fields
);

const TimelineItem = model<ITimelineItem>("TimelineItem", timelineItemSchema);

export default TimelineItem;
