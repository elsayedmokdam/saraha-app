import { Router } from "express";
import {
  allUsers,
  logout,
  profile,
  rotateToken,
  uploadProfileImage,
} from "./user.service.js";
import {
  fileValidations,
  localFileUpload,
  successResponse,
} from "../../common/utils/index.js";
import {
  authenticationMiddleware as authentication,
  authorizationMiddleware as authorization,
  uploadMiddleware,
  validationMiddleware as validation,
} from "../../middleware/index.js";
import { RoleEnum, TokenTypeEnum } from "../../common/enum/index.js";
import { logoutSchema } from "../../schema/index.js";
const router = Router();

export default router;

// Get Profile
router.get("/profile", authentication(), async (req, res) => {
  const data = await profile({ userId: req.user._id });
  return successResponse({ res, data });
});

// Upload Profile Image
router.patch(
  "/profile-image",
  authentication(),
  uploadMiddleware({
    multerMiddleware: localFileUpload({
      validation: fileValidations,
    })
    .single("attachment"),
    // .fields([
    //   { name: "image", maxCount: 1 },
    //   { name: "cover", maxCount: 1 },
    // ]),
    // .array("attachments", 3),
    validation: fileValidations.image,
    customPath: "profile",
  }),
  async (req, res) => {
    // ------------ Array ------------ //
    // const files = req.files.map((file) => file.path);
    // console.log({ files });
    // ------------ Fields ------------ //
    // const files = Object.entries(req.files).map(([key, file]) => file[0].path);
    // console.log({ files });
    // ------------ Single ------------ //
    const data = await uploadProfileImage({ user: req.user, file: req.file });
    return successResponse({ res, data });
  },
);

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

// Rotate Token
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
