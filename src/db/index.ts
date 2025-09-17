// ℹ️ Mongoose (ODM) handles the connection to MongoDB and provides schema-based modeling.
import mongoose from "mongoose";
import TimelineItem from "../models/TimelineItem.model";


export default async function connectDb() {
  // ℹ️ Connects to MongoDB using the URI from environment variables.
  try {
    const x = await mongoose.connect(process.env.MONGODB_URI ?? "");
    const dbName = x.connections[0].name;
    console.log(`Connected to Mongo! Database name: "${dbName}"`);
  } catch (err) {
    console.error("Error connecting to MongoDB: ", err);
    throw err; // Re-throw to prevent continuing if connection fails
  }

  // Ensure schema indexes exist in DB (separate try-catch for index operations)
  try {
    await TimelineItem.syncIndexes();
    console.log(`Indexes ensured for TimelineItems`);
  } catch (err) {
    console.error("Error syncing TimelineItem indexes: ", err);
    // Don't throw here - app can continue without index sync
  }
}