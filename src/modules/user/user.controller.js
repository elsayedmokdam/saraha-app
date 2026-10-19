import { Router } from "express";
import {
  allUsers,
  profile,
  rotateToken,
  updatePassword,
  updateUserData,
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
import { updatePasswordSchema, updateUserDataSchema } from "../../schema/index.js";
const router = Router();

export default router;

// Get Profile
router.get("/profile", authentication(), async (req, res) => {
  // Use this Instead of passing req.user as after upload image it will be old image and want ro be updated from DB.
  const data = await profile({ userId: req.user._id });
  return successResponse({ res, data });
  // return successResponse({ res, data: req.user });
});

// Upload Profile Image
router.patch(
  "/profile-image",
  authentication(),
  uploadMiddleware({
    multerMiddleware: localFileUpload({
      maxFileSize: 10,
    }).single("attachment"),
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
    // const files = req.files.map((file) => file.value.path);
    // console.log({ files  });
    // return successResponse({ res, data: files });
    // ------------ Fields ------------ //
    // const files = Object.entries(req.files).map(([key, file]) => file[0].path);
    // console.log({ files });
    // ------------ Single ------------ //
    const data = await uploadProfileImage({ user: req.user, file: req.file });
    return successResponse({ res, data });
  },
);

// Update User Password
router.patch(
  "/update-password",
  authentication(),
  validation(updatePasswordSchema),
  async (req, res) => {
    console.log(req.validated.body);
    const data = await updatePassword({ ...req.validated.body }, req.user);
    return successResponse({ res, data });
  },
);

// Update User Data
router.put(
  "/update-data",
  authentication(),
  validation(updateUserDataSchema),
  async (req, res) => {
    const data = await updateUserData(req.validated.body, req.user);
    return successResponse({ res, data, message: "User Updated Successfully" });
  },
);

// Get All Users (Admin)
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
