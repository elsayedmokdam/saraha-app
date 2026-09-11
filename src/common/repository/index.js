import {
  aggregate,
  create,
  deleteMany,
  find,
  findById,
  findByIdAndDelete,
  findByIdAndUpdate,
  findOne,
  findOneAndDelete,
  findOneAndReplace,
  findOneAndUpdate,
  updateMany,
} from "./db.repository.js";

export const $REPOSITORIES = {
  create,
  find,
  findOne,
  findById,
  findOneAndUpdate,
  findByIdAndUpdate,
  findOneAndReplace,
  findOneAndDelete,
  findByIdAndDelete,
  updateMany,
  deleteMany,
  aggregate,
};
