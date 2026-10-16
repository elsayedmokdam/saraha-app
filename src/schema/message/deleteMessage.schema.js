import { z } from "zod";
import { generalValidationFields } from "../../common/validation.js";

export const deleteMessageSchema = (lang) => {
  return z.object({
    params: z.strictObject({
      messageId: generalValidationFields.mongooId(lang),
    }),
    headers: generalValidationFields.header(lang),
  });
};
