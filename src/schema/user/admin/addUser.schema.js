import { z } from "zod";
import { generalValidationFields } from "../../../common/validation.js";

export const addUserSchema = (lang) =>
  z
    .object({
      body: z.strictObject({
        username: generalValidationFields.username(lang),
        email: generalValidationFields.email(lang),
        password: generalValidationFields.password(lang),
        confirmPassword: generalValidationFields.password(lang),
      }),
      headers: generalValidationFields.header(lang),
    })
    .superRefine((data, ctx) => {
      generalValidationFields.matchFields({
        data,
        field: "password",
        match: "confirmPassword",
        ctx,
        lang,
      });
    });
