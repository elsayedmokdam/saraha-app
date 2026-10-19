import { z } from "zod";
import { generalValidationFields } from "../../common/validation.js";

export const updatePasswordSchema = (lang) =>
  z.object({
      body: z.strictObject({
        currentPassword: generalValidationFields.password(lang),
        newPassword: generalValidationFields.password(lang),
        confirmPassword: generalValidationFields.password(lang),
      }).superRefine((data, ctx) => {
      generalValidationFields.matchFields({
        data,
        field: "newPassword",
        match: "confirmPassword",
        ctx,
        lang,
      });
    }),
      headers: generalValidationFields.header(lang),
    })
    
