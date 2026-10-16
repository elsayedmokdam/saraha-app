import { Router } from "express";
import {
  fileValidations,
  localFileUpload,
  successResponse,
} from "../../common/utils/index.js";
import {
  authenticationMiddleware as authentication,
  uploadMiddleware,
  validationMiddleware as validation,
} from "../../middleware/index.js";
import {
  createIdentityRequest,
  createMessage,
  deleteMessage,
  getAllMessages,
  getIdentityRequests,
  respondToIdentityRequest,
} from "./message.service.js";
import {
  createIdentityRequestSchema,
  createMessageSchema,
  deleteMessageSchema,
  getAllMessagesSchema,
  getIdentityRequestsSchema,
  respondIdentityRequestSchema,
} from "../../schema/index.js";
const router = Router();

// Send Anounemous Message
router.post(
  "/",
  authentication(),
  uploadMiddleware({
    multerMiddleware: localFileUpload({
      maxFileSize: 10,
    }).any(),
    validation: fileValidations.image,
    customPath: "message",
    isRequired: false,
  }),
  validation(createMessageSchema),
  async (req, res) => {
    const data = await createMessage(
      req.validated.body,
      req.validated.files,
      req.user,
    );
    return successResponse({
      res,
      message: "Message Sent Successfully",
      status: 201,
      data,
    });
  },
);

// Get All Messages
router.get(
  "/",
  authentication(),
  validation(getAllMessagesSchema),
  async (req, res) => {
    const data = await getAllMessages(req.validated.query, req.user);
    return successResponse({ res, data });
  },
);

// Delete Message
router.delete(
  "/:messageId",
  authentication(),
  validation(deleteMessageSchema),
  async (req, res) => {
    const data = await deleteMessage(req.validated.params, req.user);
    return successResponse({
      res,
      data,
      message: "Message Deleted Successfully",
    });
  },
);

// Send Identity Request
router.post(
  "/:messageId/identity-request",
  authentication(),
  validation(createIdentityRequestSchema),
  async (req, res) => {
    const data = await createIdentityRequest(req.validated.params, req.user);
    return successResponse({
      res,
      data,
      message: "Identity Request Sent Successfully, Please Wait For Approval",
    });
  },
);

// Respond To Identity Request
router.patch(
  "/:requestId/identity-request",
  authentication(),
  validation(respondIdentityRequestSchema),
  async (req, res) => {
    const data = await respondToIdentityRequest(
      { ...req.validated.params, ...req.validated.body },
      req.user,
    );
    return successResponse({
      res,
      data,
      message:
        data.request.status === "accepted"
          ? "Identity Request Accepted, Now You Can Chat With Each Other"
          : "Identity Request Rejected",
    });
  },
);

// Get All Identity Requests
router.get(
  "/identity-request",
  authentication(),
  validation(getIdentityRequestsSchema),
  async (req, res) => {
    const data = await getIdentityRequests(req.validated.query, req.user);
    return successResponse({ res, data });
  },
);

export default router;
