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
import {
  userBaseRevokeTokenKeyFormat,
  userCacheProfileKeyFormat,
} from "../../common/utils/index.js";
import { UserModel } from "../../DB/models/index.js";
import { LogoutEnum } from "../../common/enum/index.js";
import { del, keys } from "../../common/services/index.js";

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

export const logout = async (payload, { action = LogoutEnum.ONE }) => {
  const userId = payload.sub;

  switch (action) {
    case LogoutEnum.ALL: {
      // Get Original User From DB because user Might Be Cached in Redis
      const currentUser = await findById({
        model: UserModel,
        id: userId,
      });

      if (!currentUser) {
        throw UnauthorizedException({
          message: "Session Expired, Please Login Again",
        });
      }

      currentUser.changeCredentialsTime = new Date();
      await currentUser.save();

      // Delete All Revoked Token Keys
      const revokeTokenKeys = await keys({
        prefix: userBaseRevokeTokenKeyFormat({
          userId: currentUser._id,
        }),
      });

      if (revokeTokenKeys.length > 0) {
        await del({
          key: revokeTokenKeys,
        });
      }
      break;
    }
    default: {
      await createRevokeToken({
        payload,
      });
      break;
    }
  }
  // Delete Profile From Cache
  await del({
    key: userCacheProfileKeyFormat({
      userId: payload.sub,
    }),
  });
  return {
    message: "Logout Successful",
  };
};
