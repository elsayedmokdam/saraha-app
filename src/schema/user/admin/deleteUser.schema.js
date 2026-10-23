import { z } from "zod";
import { generalValidationFields } from "../../../common/validation.js";

export const deleteUserSchema = (lang) => 
    z.object({
        params: z.strictObject({
            userId: generalValidationFields.mongooId(lang),
        }),
        headers: generalValidationFields.header(lang),
    });
