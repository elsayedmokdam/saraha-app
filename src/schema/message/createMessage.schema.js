import { z } from "zod";
import { LanguageEnum } from "../../common/enum/index.js";
import { generalValidationFields } from "../../common/validation.js";

export const createMessageSchema = (lang) => {
  return z
    .object({
      body: z.strictObject(
        {
          content: generalValidationFields.content(lang),
          receiverId: generalValidationFields.mongooId(lang),
        },
        {
          error: (err) => {
            return err.input === undefined
              ? lang === LanguageEnum.AR
                ? (err.message = "محتوى الرسالة مطلوب")
                : (err.message = "Message content is required")
              : undefined;
          },
        },
      ),

      files: z
        .array(generalValidationFields.file(lang))
        .max(3, {
          message:
            lang === LanguageEnum.AR
              ? "الحد الأقصى 3 ملفات"
              : "Maximum 3 files allowed",
        })
        .optional(),

      headers: generalValidationFields.header(lang),
    })
    .superRefine((data, ctx) => {
      if (!data.body.content && !data.files?.length) {
        ctx.addIssue({
          code: "custom",
          path: ["body", "content"],
          message:
            lang === LanguageEnum.AR
              ? "محتوى الرسالة أو ملف واحد على الأقل مطلوب"
              : "Message content or at least one file is required",
        });
      }
    });
};
