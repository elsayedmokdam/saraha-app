import { UserModel } from "../../DB/models/user.model.js";
import { findById } from "../repository/db.repository.js";

export const checkExist = async ({ model, id }) => {
  const find = await findById({ model, id });
  if (!find) {
    throw new Error(`Invalid ${model === UserModel ? "User" : "Message"} Id`, {
      cause: { status: 404 },
    });
  }
  return find;
};
