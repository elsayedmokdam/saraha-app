import { Router } from "express";
import {
  confirmEmail,
  forgotPassword,
  login,
  logout,
  resendConfirmEmailOTP,
  resetPassword,
  signup,
  signupWithGmail,
  twoFALogin,
  verify2FALogin,
  verifyResetPasswordOTP,
} from "./authentication.service.js";
import { issuer, successResponse } from "../../common/utils/index.js";
import { validationMiddleware as validation } from "../../middleware/index.js";
import { authenticationMiddleware as authentication } from "../../middleware/index.js";
import {
  confirmEmailSchema,
  forgotPasswordSchema,
  loginSchema,
  logoutSchema,
  resendConfirmEmailSchema,
  resetPasswordSchema,
  signupSchema,
  verifyResetPasswordSchema,
} from "../../schema/index.js";
const router = Router();

// Signup with Gmail
router.post("/signup-with-gmail", async (req, res) => {
  const { data, status, message } = await signupWithGmail(
    req.body,
    issuer(req),
  );
  return successResponse({ res, data, message, status });
});

// Signup
router.post("/signup", validation(signupSchema), async (req, res) => {
  const data = await signup(req.validated.body, issuer(req));
  return successResponse({
    res,
    data,
    message: "Signup Successful, Please Confirm Your Email to Login",
    status: 201,
  });
});

// Login
router.post("/login", validation(loginSchema), async (req, res) => {
  const data = await login(req.validated.body, issuer(req));
  return successResponse({ res, data, message: "Login Successful" });
});

// 2FA Login
router.post("/2fa/login", validation(loginSchema), async (req, res) => {
  const data = await twoFALogin(req.validated.body, issuer(req));
  return successResponse({
    res,
    status: 201,
    data,
    message: "Two Step Verification Activated, OTP Sent Successfully",
  });
});

// Verify 2FA OTP
router.post(
  "/2fa/verify-otp",
  validation(confirmEmailSchema),
  async (req, res) => {
    const data = await verify2FALogin(
      {
        email: req.body.email,
        otp: req.body.otp,
      },
      issuer(req),
    );
    return successResponse({ res, data });
  },
);

// Resend Confirm Email OTP
router.post(
  "/resend-confirm-email-otp",
  validation(resendConfirmEmailSchema),
  async (req, res) => {
    const { message } = await resendConfirmEmailOTP(req.validated.body);
    return successResponse({ res, message });
  },
);

// Confirm Email
router.patch(
  "/confirm-email",
  validation(confirmEmailSchema),
  async (req, res) => {
    const data = await confirmEmail(req.validated.body);
    return successResponse({
      res,
      data,
      message: "Email Confirmed, Please You can Login",
    });
  },
);

// Forgot Password
router.post(
  "/forgot-password",
  validation(forgotPasswordSchema),
  async (req, res) => {
    const message = await forgotPassword(req.validated.body);
    return successResponse({ res, message });
  },
);

// Verify Reset Password OTP
router.post(
  "/verify-reset-password-otp",
  validation(verifyResetPasswordSchema),
  async (req, res) => {
    const { user, message } = await verifyResetPasswordOTP(req.validated.body);
    return successResponse({ res, data: user, message });
  },
);

// Reset Password
router.patch(
  "/reset-password",
  validation(resetPasswordSchema),
  async (req, res) => {
    console.log(req.validated.body);
    const { user, message } = await resetPassword(req.validated.body);
    return successResponse({ res, data: user, message });
  },
);

// Logout
router.post(
  "/logout",
  authentication(),
  validation(logoutSchema),
  async (req, res) => {
    const { message } = await logout(req.payload, req.body);
    return successResponse({ res, message });
  },
);

export default router;
