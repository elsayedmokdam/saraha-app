import express from "express";
import cors from "cors";
import { PORT } from "./config.js";
import { $MIDDLEWARES } from "./middleware/index.js";
import { initializeDB } from "./DB/connection.db.js";
import { $MODULES } from "./modules/index.js";
const { authenticationController, userController, messageController } = $MODULES;
const app = express();

// Database Connection
await initializeDB(app, PORT);

// Application Level Middleware
app.use(cors(), express.json());

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
app.use($MIDDLEWARES.globalErrorHandler);
