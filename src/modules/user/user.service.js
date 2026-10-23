import { ACCESS_TOKEN_EXPIRES_IN } from "../../config.js";
import { ConflictException } from "../../common/exceptions/index.js";
import {
  create,
  find,
  findById,
  findByIdAndDelete,
  findByIdAndUpdate,
  findOne,
} from "../../common/repository/index.js";
import {
  compare,
  createLoginCredentials,
  createRevokeToken,
  encryption,
  hash,
} from "../../common/security/index.js";
import { UserModel } from "../../DB/models/index.js";
import { toObjectId } from "../../common/utils/index.js";

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
  const { username, phone, ...rest } = inputs;
  const update = { ...rest };

  const [firstName, lastName] = username.trim().split(" ") || [];
  update.firstName = firstName;
  update.lastName = lastName;
  update.phone = await encryption(phone);

  const updated = await findByIdAndUpdate({
    model: UserModel,
    id: user._id,
    update,
  });
  return updated;
};

//=========== Admin Actions ===========
export const allUsers = async (user, { page = 1, limit = 10 }) => {
  const users = await find({
    model: UserModel,
    filter: {
      _id: { $ne: user._id },
    },
    options: {
      page,
      limit,
      sort: { createdAt: 1 },
    },
  });
  return users;
};

export const deleteUser = async ({ userId }) => {
  const existUser = await findById({
    model: UserModel,
    id: userId,
  });

  if (!existUser) throw ConflictException({ message: "User Not Found" });

  const deletedUser = await findByIdAndDelete({
    model: UserModel,
    id: userId,
  });
  return deletedUser;
};

export const addUser = async (inputs) => {
  const existAccount = await findOne({
    model: UserModel,
    filter: { email: inputs.email },
  });

  if (existAccount)
    throw ConflictException({ message: "Email Already Exists" });

  const user = await create({
    model: UserModel,
    data: [
      {
        ...inputs,
        password: await hash(inputs.password),
        confirmPassword: await hash(inputs.confirmPassword),
        isCreated: true,
      },
    ],
    options: { validateBeforeSave: true },
  });
  return user;
};

export const updateUser = async (inputs, { userId }) => {
  const [firstName, lastName] = inputs.username.trim().split(" ") || [];
  inputs.firstName = firstName;
  inputs.lastName = lastName;

  const existAccount = await findOne({
    model: UserModel,
    filter: { email: inputs.email },
  });

  if (existAccount)
    throw ConflictException({ message: "Email Already Exists" });

  const user = await findByIdAndUpdate({
    model: UserModel,
    id: toObjectId(userId),
    update: inputs,
  });
  if (!user) throw ConflictException({ message: "User Not Found" });
  return user;
};

//=========== Admin Actions ===========

export const rotateToken = async (payload, user, issuer) => {
  const accessExpiresIn = (payload.iat + ACCESS_TOKEN_EXPIRES_IN) * 1000; // Expires in in milliseconds
  const remainingTime = accessExpiresIn - Date.now(); // Remaining time in milliseconds

  const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds

  // Meaning the access token is still valid
  if (remainingTime > tenMinutes) {
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
