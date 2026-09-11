import { authenticationController } from "./authentication/index.js";
import { messageController } from "./message/index.js";
import { userController } from "./user/index.js";

export const $MODULES = {
  authenticationController,
  userController,
  messageController,
};
