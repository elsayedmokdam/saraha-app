import { Router } from "express";
import {
  login,
  signup,
  signupWithGmail,
} from "./authentication.service.js";
const router = Router();
// -----------    COMMONS    -----------
import { $UTILS } from "../../common/utils/index.js";
import { $MIDDLEWARES } from "../../middleware/index.js";
import { $SCHEMAS } from "../../schema/index.js";
// -----------    COMMONS    -----------
// ----------- DESTRUCTURING -----------
const { successResponse, issuer } = $UTILS;
const { validation } = $MIDDLEWARES;
const { loginSchema, signupSchema } = $SCHEMAS;
// ----------- DESTRUCTURING -----------

// Signup
router.post("/signup", validation(signupSchema), async (req, res) => {
  const data = await signup(req.validated.body, issuer(req));
  return successResponse({
    res,
    data,
    message: "Signup Successful",
    status: 201,
  });
});

// Login
router.post("/login", validation(loginSchema), async (req, res) => {
  const data = await login(req.validated.body, issuer(req));
  return successResponse({ res, data, message: "Login Successful" });
});

// Signup with Gmail
router.post("/signup-with-gmail", async (req, res) => {
  const { data, status, message } = await signupWithGmail(
    req.body,
    issuer(req),
  );
  return successResponse({ res, data, message, status });
});

export default router;
