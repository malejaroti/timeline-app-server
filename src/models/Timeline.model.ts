import { Schema, model, Document } from "mongoose";

// Interface that describes a Timeline document
export interface ITimeline extends Document {
  owner: Schema.Types.ObjectId;
  title: String;
  icon?: String
  description?: String;
  startDate?: Date;
  endDate?: Date;
  collaborators?: [Schema.Types.ObjectId];
  isPublic: Boolean;
  color?: String;
  createdAt: Date;
  updatedAt: Date;
}

const timelineSchema = new Schema<ITimeline>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      unique: true,
    },
    icon:{
      type: String,
      required: false
    },
    description: {
      type: String,
      required: false,
    },
    startDate: {
      type: Date,
      required: false, // can be calculated from "moments"
    },
    endDate: {
      type: Date,
      required: false, // can be calculated from "moments"
    },
    collaborators: {
      type: [Schema.Types.ObjectId],
      ref: "User"
    },
    isPublic: {
      type: Boolean,
      required: false,
      default: false,
    },
    color: {
      type: String,
      required: false,
      default: "grey"
    }
  },
  { timestamps: true } // adds createdAt / updatedAt fields
);

// Create the typed model
const Timeline = model<ITimeline>("Timeline", timelineSchema);

export default Timeline;
