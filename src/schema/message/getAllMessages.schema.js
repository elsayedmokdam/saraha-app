import { z } from "zod";
import { LanguageEnum, MessageTypeEnum } from "../../common/enum/index.js";
import { generalValidationFields } from "../../common/validation.js";

export const getAllMessagesSchema = (lang) => {
  return z.object({
    query: z.strictObject({
      type: z
        .enum(MessageTypeEnum, {
          message:
            lang === LanguageEnum.AR
              ? "خيار غير صالح: يجب ان يكون احد الخيارات 0|1|2"
              : "Invalid option: expected one of 0|1|2",
        })
        .default(MessageTypeEnum.BOTH),
      page: z.string().optional(),
      limit: z.string().optional(),
      search: z.string().optional(),
      sort: z.string().optional(),
    }),
    headers: generalValidationFields.header(lang),
  });
};
