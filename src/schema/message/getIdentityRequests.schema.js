import { z } from "zod";
import { generalValidationFields } from "../../common/validation.js";

export const getIdentityRequestsSchema = (lang) =>
  z.object({
    query: z.strictObject({
      page: z.string().optional(),
      limit: z.string().optional(),
    }),
    headers: generalValidationFields.header(lang),
  });
