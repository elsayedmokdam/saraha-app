import { z } from "zod";
import { generalValidationFields } from "../../common/validation.js";

export const resendConfirmEmailSchema = (lang) => {
  return z.object({
    body: z.strictObject({
      email: generalValidationFields.email(lang),
    }),
    headers: generalValidationFields.header(lang),
  });
};
