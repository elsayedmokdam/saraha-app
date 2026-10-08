import { confirmEmailSchema } from "./confirmEmail.schema.js";

export const verifyResetPasswordSchema = (lang) => confirmEmailSchema(lang);
