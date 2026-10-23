import { z } from "zod";
import { generalValidationFields } from "../../../common/validation.js";

export const updateUserSchema = (lang) =>
  z.object({
    body: z.strictObject({
      username: generalValidationFields.username(lang),
      email: generalValidationFields.email(lang),
    }),
    params: z.strictObject({
      userId: generalValidationFields.mongooId(lang),
    }),
    headers: generalValidationFields.header(lang),
  });
