import { z } from "zod";
import { generalValidationFields } from "../../common/validation.js";

export const confirmEmailSchema = (lang) => {
  return z.object({
    body: z.strictObject({
      email: generalValidationFields.email(lang),
      otp: generalValidationFields.otp(lang),
    }),
    headers: generalValidationFields.header(lang),
  });
};
