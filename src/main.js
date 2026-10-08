import express from "express";
import cors from "cors";
import { PORT } from "./config.js";
import { initializeDB } from "./DB/connection.db.js";
import {
  authenticationController,
  messageController,
  userController,
} from "./modules/index.js";
import { globalErrorHandler } from "./middleware/index.js";
const app = express();

// Database Connection
await initializeDB(app, PORT);

// Application Level Middleware
app.use(cors(), express.json());
app.use("/assets", express.static("./assets"))

//------------- Application Routes -------------
// Test Route
app.all("/", (req, res) =>
  res.status(200).json({ message: "Welcome to DB API 🌸" }),
);
// Authentication Routes
app.use("/auth", authenticationController);
// User Routes
app.use("/user", userController);
// Message Routes
app.use("/message", messageController);
// Handle Invalid Routes
app.all("{/*dummy}", (req, res) => {
  res.status(404).json({ message: "Invalid Application Route" });
});

// Global Error Handler
app.use(globalErrorHandler);
