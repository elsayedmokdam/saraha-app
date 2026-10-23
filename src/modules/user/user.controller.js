import { Router } from "express";
import {
  addUser,
  allUsers,
  deleteUser,
  profile,
  rotateToken,
  updatePassword,
  updateUser,
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
import {
  addUserSchema,
  deleteUserSchema,
  updatePasswordSchema,
  updateUserDataSchema,
  updateUserSchema,
} from "../../schema/index.js";
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

//=========== Admin Actions ===========

// Get All Users (Admin)
router.get(
  "/all",
  authentication(),
  authorization(RoleEnum.ADMIN),
  async (req, res) => {
    const data = await allUsers(req.user, req.query);
    return successResponse({ res, data });
  },
);

// Delete User
router.delete(
  "/:userId/delete-user",
  authentication(),
  authorization(RoleEnum.ADMIN),
  validation(deleteUserSchema),
  async (req, res) => {
    const data = await deleteUser(req.validated.params, req.user);
    return successResponse({
      res,
      data,
      message: "User Deleted Successfully",
    });
  },
);

// Add User
router.post(
  "/add-user",
  authentication(),
  authorization(RoleEnum.ADMIN),
  validation(addUserSchema),
  async (req, res) => {
    const data = await addUser(req.validated.body);
    return successResponse({ res, data, message: "User Added Successfully" });
  },
);

// Update User
router.put(
  "/:userId/update-user",
  authentication(),
  authorization(RoleEnum.ADMIN),
  validation(updateUserSchema),
  async (req, res) => {

    const data = await updateUser(req.validated.body, req.validated.params);
    return successResponse({ res, data, message: "User Updated Successfully" });
  },
);

//=========== Admin Actions ===========

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
