import { z } from "zod";

export const loginSchema = z.strictObject({
  email: z.email(),
  password: z.string().min(6).max(20),
});
