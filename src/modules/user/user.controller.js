import { Router } from "express";
import { allUsers, profile, rotateToken } from "./user.service.js";
import { $UTILS } from "../../common/utils/index.js";
import { $MIDDLEWARES } from "../../middleware/index.js";
import { $ENUMS } from "../../common/enum/index.js";
const router = Router();
const { successResponse } = $UTILS;
const { authentication, authorization } = $MIDDLEWARES;
const { TokenTypeEnum, RoleEnum } = $ENUMS;

export default router;

// Get Profile
router.get("/profile", authentication(), async (req, res) => {
  const data = await profile(req.user);
  return successResponse({ res, data });
});

// Get All Users
router.get(
  "/all",
  authentication(),
  authorization(RoleEnum.ADMIN),
  async (req, res) => {
    const data = await allUsers(req.user);
    return successResponse({ res, data });
  },
);

// Refresh Token
router.post(
  "/rotate-token",
  authentication(TokenTypeEnum.REFRESH),
  async (req, res) => {
    const data = await rotateToken(
      req.payload,
      req.user,
      `${req.protocol}://${req.host}`,
    );
    return successResponse({ res, data });
  },
);
