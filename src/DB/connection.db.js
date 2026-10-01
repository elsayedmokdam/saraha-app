import mongoose from "mongoose";
import { DB_URI } from "../config.js";
import { $MODELS } from "./models/index.js";
import { connectRedis } from "./redis.connection.js";
const { UserModel, MessageModel } = $MODELS;

export const initializeDB = async (app, port) => {
  try {
    // Test DB Connection
    await mongoose.connect(DB_URI);
    console.log("Database Connected Successfully ✅");
    await connectRedis();
  } catch (error) {
    console.log(`Failed to Connect Database ❌ ${error}`);
    return;
  }

  try {
    // Sync Indexes
    await UserModel.syncIndexes(); // Any changes in the schema will be reflected in the database indexes.
    await MessageModel.syncIndexes();
    console.log("Indexes Synced Successfully ✅");

    // Start The Server
    app.listen(port, () => console.log(`App listening on port ${port} 🚀`));
  } catch (error) {
    console.log(`Failed to Sync Indexes ❌ ${error}`);
  }
};
