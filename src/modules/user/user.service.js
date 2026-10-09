import { ACCESS_TOKEN_EXPIRES_IN } from "../../config.js";
import {
  ConflictException,
  UnauthorizedException,
} from "../../common/exceptions/index.js";
import {
  find,
  findById,
  findByIdAndUpdate,
} from "../../common/repository/index.js";
import {
  createLoginCredentials,
  createRevokeToken,
} from "../../common/security/index.js";

import { UserModel } from "../../DB/models/index.js";

export const profile = async ({ userId }) => {
  const user = await findById({
    model: UserModel,
    id: userId,
  });
  return user;
};

export const uploadProfileImage = async ({ user, file }) => {
  const updatedUser = await findByIdAndUpdate({
    model: UserModel,
    id: user._id,
    update: { image: file.path },
  });
  return updatedUser;
};

export const allUsers = async (user) => {
  const users = await find({
    model: UserModel,
    query: {
      _id: { $ne: user._id },
    },
  });
  return users;
};

export const rotateToken = async (payload, user, issuer) => {
  const accessExpiresIn = (payload.iat + ACCESS_TOKEN_EXPIRES_IN) * 1000; // Expires in in milliseconds
  const currentTime = Date.now() + 10 * 60 * 1000; // Current time in milliseconds + 10 minutes

  // Meaning the access token is still valid
  if (accessExpiresIn > currentTime) {
    throw ConflictException({ message: "Access token is still valid" });
  }
  const { access_token, refresh_token } = await createLoginCredentials({
    payload: user,
    options: {
      issuer,
    },
  });
  await createRevokeToken({ payload });
  return {
    access_token,
    refresh_token,
    user,
  };
};
