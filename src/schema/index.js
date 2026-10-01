import { headerSchema } from "./header.schema.js";
import { loginSchema } from "./login.schema.js";
import { logoutSchema } from "./logout.schema.js";
import { signupSchema } from "./signup.schema.js";

export const $SCHEMAS = {
  loginSchema,
  signupSchema,
  headerSchema,
  logoutSchema,
};
