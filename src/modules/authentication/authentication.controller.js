import { Router } from "express";
import { login, signup } from "./authentication.service.js";
import { $UTILS } from "../../common/utils/index.js";
const router = Router();
const { successResponse } = $UTILS;

// Signup
router.post("/signup", async (req, res) => {
  const data = await signup(req.body);
  return successResponse({
    res,
    data,
    message: "Account Created Successfully",
    status: 201,
  });
});

// Login
router.post("/login", async (req, res) => {
  const data = await login(req.body);
  return successResponse({ res, data, message: "Login Successful" });
});

export default router;
