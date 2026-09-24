import { z } from "zod";
import { $ENUMS } from "../common/enum/index.js";
import { loginSchema } from "./login.schema.js";
const { GenderEnum, RoleEnum } = $ENUMS;

// Use safeExtend instead of extend if using refine or superRefine
export const signupSchema = loginSchema
  .safeExtend({
    username: z.string().min(3).max(20),
    confirmPassword: z.string().min(6).max(20),
    DOB: z.coerce.date().optional(),
    phone: z.e164().optional(),
    image: z.string().optional(),
    imageCover: z.array(z.string()).optional(),
    gender: z.enum(Object.values(GenderEnum)).optional(),
    role: z.enum(Object.values(RoleEnum)).optional(),
  })
  .superRefine(({ password, confirmPassword, username }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }

    if (!username.includes(" ")) {
      ctx.addIssue({
        code: "custom",
        path: ["username"],
        message: "Username must contain 2 parts",
      });
    }
  });
