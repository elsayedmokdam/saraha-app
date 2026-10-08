import { resendConfirmEmailSchema } from "./resendConfirmEmail.schema.js";

export const forgotPasswordSchema = (lang) => resendConfirmEmailSchema(lang);
