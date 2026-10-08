import { ForbiddenException } from "../common/exceptions/index.js";

export const authorizationMiddleware = (accessRole) => {
  return (req, res, next) => {
    if (req.user.role < accessRole) {
      throw ForbiddenException({
        message: "You are not allowed to perform this action",
      });
    }
    next();
  };
};
