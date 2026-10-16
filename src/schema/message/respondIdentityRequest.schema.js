import { z } from "zod";
import {
  IdentityRequestStatusEnum,
  LanguageEnum,
} from "../../common/enum/index.js";
import { generalValidationFields } from "../../common/validation.js";

export const respondIdentityRequestSchema = (lang) =>
  z.object({
    params: z.strictObject({
      requestId: generalValidationFields.mongooId(lang),
    }),
    body: z.strictObject(
      {
        status: z.enum(
          [
            IdentityRequestStatusEnum.ACCEPTED,
            IdentityRequestStatusEnum.REJECTED,
          ],
          {
            message:
              lang === LanguageEnum.AR
                ? `${IdentityRequestStatusEnum.ACCEPTED}|${IdentityRequestStatusEnum.REJECTED} خيار غير صالح: يجب ان يكون احد الخيارات`
                : `Invalid option: expected one of ${IdentityRequestStatusEnum.ACCEPTED}|${IdentityRequestStatusEnum.REJECTED}`,
          },
        ),
      },
      {
        error: (err) => {
          return err.input === undefined
            ? lang === LanguageEnum.AR
              ? (err.message = "خيار غير صالح: يجب ان يكون احد الخيارات")
              : (err.message =
                  "Invalid option: expected one of ACCEPTED|REJECTED")
            : undefined;
        },
      },
    ),
    headers: generalValidationFields.header(lang),
  });
