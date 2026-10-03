import { ACCESS_TOKEN_EXPIRES_IN } from "../../config.js";

// -----------    COMMONS    -----------
import { $EXCEPTIONS } from "../../common/exceptions/index.js";
import { $REPOSITORIES } from "../../common/repository/index.js";
import { $SECURITY } from "../../common/security/index.js";
import { $UTILS } from "../../common/utils/index.js";
import { $MODELS } from "../../DB/models/index.js";
import { $ENUMS } from "../../common/enum/index.js";
import { $CACHE_SERVICES } from "../../common/services/index.js";
// -----------    COMMONS    -----------
// ----------- DESTRUCTURING -----------
const { UserModel } = $MODELS;
const { find } = $REPOSITORIES;
const { userBaseRevokeTokenKeyFormat } = $UTILS;
const { ConflictException } = $EXCEPTIONS;
const { createLoginCredentials, createRevokeToken } = $SECURITY;
const { LogoutEnum } = $ENUMS;
const { del, keys } = $CACHE_SERVICES;
// ----------- DESTRUCTURING -----------

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
  const currentTime = Date.now() + 5 * 60 * 1000; // Current time in milliseconds + 10 minutes

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

export const logout = async (payload, user, { action = LogoutEnum.ONE }) => {
  switch (action) {
    case LogoutEnum.ALL:
      user.changeCredentialsTime = Date.now();
      await user.save();
      const revokeTokenKeys = await keys({
        prefix: userBaseRevokeTokenKeyFormat({
          userId: user._id,
        }),
      });
      if (revokeTokenKeys.length > 0) {
        await del({ key: revokeTokenKeys });
      }
      break;
    default:
      await createRevokeToken({ payload });
      break;
  }

  return { message: "Logout Successful" };
};
