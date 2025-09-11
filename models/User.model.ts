// const { Schema, model } = require("mongoose");
import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  email: String;
  password: String;
  username: String;
  name: String;
  friends?:[Schema.Types.ObjectId]
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required.']
    },
    username: {
      type: String,
      required: false
    },
    name: {
      type: String,
      required: false
    },
    friends:{
      type: [Schema.Types.ObjectId],
      required: false
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`    
    timestamps: true
  }
);

const User = model<IUser>("User", userSchema);

// module.exports = User;
export default User;

