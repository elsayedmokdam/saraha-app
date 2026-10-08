import { generalValidationFields } from "../../common/validation.js";
import { confirmEmailSchema } from "./confirmEmail.schema.js";

export const resetPasswordSchema = (lang) => {
  const schema = confirmEmailSchema(lang);
  return schema
    .safeExtend({
      body: schema.shape.body.safeExtend({
        newPassword: generalValidationFields.password(lang),
        confirmPassword: generalValidationFields.password(lang),
      }),
    })
    .superRefine((data, ctx) => {
      generalValidationFields.matchFields({
        data: data.body,
        field: "newPassword",
        match: "confirmPassword",
        ctx,
        lang,
      });
    });
};
