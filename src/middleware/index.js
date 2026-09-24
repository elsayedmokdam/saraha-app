import { authenticationMiddleware } from "./authentication.middleware.js";
import { authorizationMiddleware } from "./authorization.middleware.js";
import { globalErrorHandler } from "./error.middleware.js";
import { validationMiddleware } from "./validation.middleware.js";

export const $MIDDLEWARES = {
  globalErrorHandler,
  authentication: authenticationMiddleware,
  authorization: authorizationMiddleware,
  validation: validationMiddleware,
};
