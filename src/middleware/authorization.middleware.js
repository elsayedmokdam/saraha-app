import { $EXCEPTIONS } from "../common/exceptions/index.js";

const { ForbiddenException } = $EXCEPTIONS;

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
