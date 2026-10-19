import { z } from "zod";
import { generalValidationFields } from "../../common/validation.js";
import { GenderEnum, LanguageEnum, RoleEnum } from "../../common/enum/index.js";

// Use safeExtend instead of extend if using refine or superRefine
export const updateUserDataSchema = (lang) => {
  return z.object({
    body: z
      .strictObject({
        username: generalValidationFields.username(lang),
        email: generalValidationFields.email(lang),
        phone: generalValidationFields.phone(lang),
        DOB: z.coerce.date().optional(),
        gender: z
          .enum(GenderEnum, {
            message:
              lang === LanguageEnum.AR
                ? "خيار غير صالح: يجب أن يكون أحد الخيارات 0|1"
                : "Invalid option: expected one of 0|1",
          })
          .optional(),
        role: z
          .enum(RoleEnum, {
            message:
              lang === LanguageEnum.AR
                ? "خيار غير صالح: يجب أن يكون أحد الخيارات 0|1"
                : "Invalid option: expected one of 0|1",
          })
          .optional(),
      })
      .superRefine((data, ctx) => {
        if (!data.username.includes(" ")) {
          ctx.addIssue({
            code: "custom",
            path: ["username"],
            message:
              lang === LanguageEnum.AR
                ? "اسم المستخدم يجب ان يحتوي على مسافة واحدة على الأقل"
                : "Username must contain at least one space",
          });
        }
      }),
    headers: generalValidationFields.header(lang),
  });
};
