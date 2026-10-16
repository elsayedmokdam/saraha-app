import { Router } from "express";
import {
  authenticationMiddleware as authentication,
  uploadMiddleware,
  validationMiddleware as validation,
} from "../../middleware/index.js";
import { createConversationMessageSchema } from "../../schema/index.js";
import {
  fileValidations,
  localFileUpload,
  successResponse,
} from "../../common/utils/index.js";
import {
  createConversationMessage,
  getAllConversationMessages,
} from "./conversation.service.js";
const router = Router();

// Send Conversation Message
router.post(
  "/:conversationId/messages",
  uploadMiddleware({
    multerMiddleware: localFileUpload({
      maxFileSize: 20,
    }).any(),
    customPath: "conversation",
    isRequired: false,
    validation: fileValidations.image,
  }),
  authentication(),
  validation(createConversationMessageSchema),
  async (req, res) => {
    const data = await createConversationMessage(
      { ...req.validated.body, ...req.validated.params },
      req.validated.files,
      req.user,
    );
    return successResponse({ res, data });
  },
);

// Get All Conversation Messages
router.get("/:conversationId/messages", authentication(), async (req, res) => {
  const data = await getAllConversationMessages({
    ...req.params,
    ...req.query,
  });
  return successResponse({ res, data });
});

export default router;
