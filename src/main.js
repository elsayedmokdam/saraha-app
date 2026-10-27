// For a Problem in Ip Address with Node.
import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { CORS_ORIGINS, PORT } from "./config.js";
import { initializeDB } from "./DB/connection.db.js";
import {
  authenticationController,
  messageController,
  userController,
} from "./modules/index.js";
import { globalErrorHandler } from "./middleware/index.js";
import { conversationController } from "./modules/conversation/index.js";
import { generateRateLimiter } from "./common/utils/limiter.js";

const app = express();

// Database Connection
await initializeDB(app, PORT);

const corsOptions = {
  origin: function (origin, callback) {
    if (!CORS_ORIGINS.includes(origin))
      callback(new Error("Unauthorized Origin"), { cause: { status: 401 } });
    else callback(null, CORS_ORIGINS);
  },
};

// ------------- Application Middleware -------------
// Ask User to allow showing the ip (trust proxy). key sent in headers `x-forwarded-for`.
// Can detect the allowed ips instead of true setting in trust proxy.
app.set("trust proxy", true);
// Application Level Middleware
app.use(
  morgan("combined"),
  helmet(),
  cors(),
  generateRateLimiter({ limit: 1000 }),
  express.json(),
);
app.use("/assets", express.static("./assets"));

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
// Conversation Routes
app.use("/conversation", conversationController);

// Handle Invalid Routes
app.all("{/*dummy}", (req, res) => {
  res.status(404).json({ message: "Invalid Application Route" });
});

// Global Error Handler
app.use(globalErrorHandler);
