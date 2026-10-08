import { LanguageEnum } from "../common/enum/index.js";
import { BadRequestException } from "../common/exceptions/index.js";

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
