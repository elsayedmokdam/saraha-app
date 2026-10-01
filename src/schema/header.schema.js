import { z } from "zod";

export const headerSchema = () => {
  return z.object({
    "accept-language": z
      .union([z.literal("0"), z.literal("1")], {
        message: "Accept-Language must be 0 or 1",
      })
      .default(0)
      .optional(),
  });
};
