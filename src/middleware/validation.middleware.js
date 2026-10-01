import { $ENUMS } from "../common/enum/index.js";
import { $EXCEPTIONS } from "../common/exceptions/index.js";
const { BadRequestException } = $EXCEPTIONS;
const { LanguageEnum } = $ENUMS;

export const validationMiddleware = (schema) => {
  return (req, res, next) => {
    const lang = req.headers["accept-language"]
      ? Number(req.headers["accept-language"])
      : LanguageEnum.EN;
      
    const validationResult = schema(lang).safeParse({
      body: req.body,
      headers: req.headers,
    });

    if (!validationResult.success) {
      throw BadRequestException({
        message: "Validation Error",
        issues: validationResult.error.issues.map((issue) => issue.message),
      });
    } else {
      req.validated = validationResult.data;
      next();
    }
  };
};
