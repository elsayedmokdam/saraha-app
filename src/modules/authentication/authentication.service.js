import { $EXCEPTIONS } from "../../common/exceptions/index.js";
import { $REPOSITORIES } from "../../common/repository/index.js";
import { $MODELS } from "../../DB/models/index.js";
import { $SECURITY } from "../../common/security/index.js";
const { UserModel } = $MODELS;
const { create, findOne } = $REPOSITORIES;
const { ConflictException, NotFoundException } = $EXCEPTIONS;
const { hash, compare, encryption, decryption } = $SECURITY;

// Signup
export const signup = async (inputs) => {
  const checkDuplicate = await findOne({
    model: UserModel,
    query: { email: inputs.email },
  });
  if (checkDuplicate) ConflictException({ message: "Email Already Exists" });
  const account = await create({
    model: UserModel,
    data: [
      {
        ...inputs,
        password: await hash(inputs.password),
        phone: await encryption(inputs.phone),
      },
    ],
    options: { validateBeforeSave: true },
  });
  return account;
};

// Login
export const login = async ({ email, password }) => {
  const account = await findOne({
    model: UserModel,
    query: { email },
  });
  const match = await compare(password, account.password);
  if (!match) NotFoundException({ message: "Invalid Login Credentials" });
  account.phone = await decryption(account.phone);
  return account;
};
