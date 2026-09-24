import { $EXCEPTIONS } from "../common/exceptions/index.js";
const { BadRequestException } = $EXCEPTIONS;

export const validationMiddleware = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw BadRequestException({
        message: "Validation Error",
        issues: result.error.issues.map((issue) => issue.message),
      });
    } else {
      req.body = result.data;
      next();
    }
  };
};
