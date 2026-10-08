import { z } from "zod";
import { generalValidationFields } from "../../common/validation.js";
import { headerSchema } from "../common/header.schema.js";

export const loginBodySchema = (lang) => {
  return z.strictObject({
    email: generalValidationFields.email(lang),
    password: generalValidationFields.password(lang),
  });
};

export const loginSchema = (lang) => {
  return z.object({
    body: loginBodySchema(lang),
    headers: headerSchema(),
  });
};
