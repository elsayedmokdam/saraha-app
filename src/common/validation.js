import { z } from "zod";
import { LanguageEnum } from "./enum/index.js";

const matchFields = ({ data, field, match, ctx, lang }) => {
  if (data[field] !== data[match]) {
    ctx.addIssue({
      code: "custom",
      path: [match],
      message:
        lang == LanguageEnum.AR
          ? "كلمة المرور غير متطابقة"
          : "Passwords do not match",
    });
  }
};

export const generalValidationFields = {
  username: (lang) =>
    z
      .string()
      .min(3, {
        message:
          lang == LanguageEnum.AR
            ? "اسم المستخدم يجب ان يكون على الاقل 3 حروف"
            : "Username must be at least 3 characters.",
      })
      .max(20),

  email: (lang) =>
    z.email({
      message:
        lang == LanguageEnum.AR
          ? "البريد الالكتروني غير صحيح"
          : "Only valid email is allowed.",
    }),

  password: (lang) =>
    z
      .string()
      .min(6, {
        message:
          lang == LanguageEnum.AR
            ? "كلمة المرور يجب ان تكون على الاقل 6 حروف"
            : "Password must be at least 6 characters.",
      })
      .max(20, {
        message:
          lang == LanguageEnum.AR
            ? "كلمة المرور يجب أن لا تتجاوز 20 حرف"
            : "Password must not exceed 20 characters.",
      })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,20}$/,
        {
          message:
            lang == LanguageEnum.AR
              ? "كلمة المرور يجب ان تحتوي على حرف كبير وحرف صغير ورقم وحرف خاص"
              : "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        },
      ),

  phone: (lang) =>
    z.string().regex(/^(\+2|002)?01[0125][0-9]{8}$/, {
      message:
        lang == LanguageEnum.AR
          ? "من فضلك ادخل رقم هاتف مصري صحيح"
          : "Only valid Egyptian phone number is allowed.",
    }),

  otp: (lang) =>
    z.string().regex(/^[0-9]{6}$/, {
      message:
        lang == LanguageEnum.AR
          ? "من فضلك ادخل رمز التحقق صحيح"
          : "Only valid OTP is allowed.",
    }),

  matchFields,
};
