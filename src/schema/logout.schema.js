import { z } from "zod";
import { $ENUMS } from "../common/enum/index.js";
const { LogoutEnum } = $ENUMS;

export const logoutSchema = (lang) => {
  return z.strictObject({
    action: z.enum(LogoutEnum).default(LogoutEnum.ONE),
  });
};
