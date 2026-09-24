import { $EXCEPTIONS } from "../../common/exceptions/index.js";
import { $REPOSITORIES } from "../../common/repository/index.js";
import { $SECURITY } from "../../common/security/index.js";
import { $UTILS } from "../../common/utils/index.js";
import { ACCESS_TOKEN_EXPIRES_IN } from "../../config.js";
import { $MODELS } from "../../DB/models/index.js";
const { UserModel } = $MODELS;
const { find } = $REPOSITORIES;
const {} = $UTILS;
const { ConflictException } = $EXCEPTIONS;
const { createLoginCredentials } = $SECURITY;

export const profile = async (user) => {
  return user;
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
  return {
    access_token,
    refresh_token,
    user,
  };
};
