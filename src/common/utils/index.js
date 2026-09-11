import { checkExist } from "./checkExist.js";
import { toObjectId } from "./ObjectId.js";
import { successResponse } from "./success.response.js";

export const $UTILS = {
  successResponse,
  toObjectId: (value) => toObjectId(value),
  checkExist: ({ model, id }) => checkExist({ model, id }),
};
