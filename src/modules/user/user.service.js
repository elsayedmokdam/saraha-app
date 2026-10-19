import { ACCESS_TOKEN_EXPIRES_IN } from "../../config.js";
import { ConflictException } from "../../common/exceptions/index.js";
import {
  find,
  findById,
  findByIdAndUpdate,
  findOne,
} from "../../common/repository/index.js";
import {
  compare,
  createLoginCredentials,
  createRevokeToken,
  hash,
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

export const updatePassword = async (
  { currentPassword, newPassword, confirmPassword },
  user,
) => {
  const userFound = await findById({
    model: UserModel,
    id: user._id,
    select: "password",
  });

  if (!(await compare(currentPassword, userFound.password)))
    throw ConflictException({ message: "Invalid Password" });

  const updated = await findByIdAndUpdate({
    model: UserModel,
    id: user._id,
    update: {
      password: await hash(newPassword),
      confirmPassword: await hash(confirmPassword),
    },
  });
  return updated;
};

export const updateUserData = async (inputs, user) => {
  const { username, ...rest } = inputs;
  const update = { ...rest };

  const [firstName, lastName] = username.trim().split(" ") || [];
  update.firstName = firstName;
  update.lastName = lastName;

  const updated = await findByIdAndUpdate({
    model: UserModel,
    id: user._id,
    update,
  });
  return updated;
};

export const allUsers = async (user) => {
  const users = await find({
    model: UserModel,
    filter: {
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
