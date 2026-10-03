import { OAuth2Client } from "google-auth-library";
import { WEB_CLIENT_IDs } from "../../config.js";
// -----------    COMMONS    -----------
import { $EXCEPTIONS } from "../../common/exceptions/index.js";
import { $REPOSITORIES } from "../../common/repository/index.js";
import { $MODELS } from "../../DB/models/index.js";
import { $SECURITY } from "../../common/security/index.js";
import { $ENUMS } from "../../common/enum/index.js";
// -----------    COMMONS    -----------
// ----------- DESTRUCTURING -----------
const { UserModel } = $MODELS;
const { create, findOne } = $REPOSITORIES;
const { ConflictException, NotFoundException, BadRequestException } =
  $EXCEPTIONS;
const { hash, compare, encryption, createLoginCredentials } =
  $SECURITY;
const { ProviderEnum, RoleEnum } = $ENUMS;
// ----------- DESTRUCTURING -----------

const client = new OAuth2Client();
async function verifyGoogleIDToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: WEB_CLIENT_IDs,
  });
  const payload = ticket.getPayload();
  // console.log({ payload });
  if (!payload?.email_verified) {
    throw BadRequestException({ message: "Email not verified" });
  }
  return payload;
}

// Signup with Gmail
export const signupWithGmail = async ({ idToken }, issuer) => {
  // console.log({ idToken });
  const { name, email, picture } = await verifyGoogleIDToken(idToken);
  const existAccount = await findOne({
    model: UserModel,
    query: { email },
  });
  // console.log({ existAccount });

  if (existAccount) {
    // 1. Exist and Provider is not Google, then Conflict
    if (existAccount.provider !== ProviderEnum.GOOGLE) {
      ConflictException({ message: "Invalid Account Provider" });
    }
    // 2. Exist and Provider is Google, then Login
    return {
      status: 200,
      message: "Login Successful",
      data: await createLoginCredentials({
        payload: {
          sub: existAccount._id,
          role: existAccount.role,
        },
        options: { issuer },
      }),
    };
  }

  // 3. Not Exist, then Signup with Gmail
  const user = await create({
    model: UserModel,
    data: [
      {
        username: name,
        email,
        confirmEmail: Date.now(),
        image: picture,
        provider: ProviderEnum.GOOGLE,
        role: RoleEnum.USER,
      },
    ],
  });
  // console.log(user);

  return {
    status: 201,
    message: "Signup Successful",
    data: await createLoginCredentials({
      payload: {
        sub: user._id,
        role: user.role,
      },
      options: { issuer },
    }),
  };
};

// Signup
export const signup = async (inputs) => {
  const checkDuplicate = await findOne({
    model: UserModel,
    query: { email: inputs.email },
  });
  if (checkDuplicate) ConflictException({ message: "Email Already Exists" });
  const user = await create({
    model: UserModel,
    data: [
      {
        ...inputs,
        password: await hash(inputs.password),
        confirmPassword: await hash(inputs.confirmPassword),
        phone: await encryption(inputs.phone),
      },
    ],
    options: { validateBeforeSave: true },
  });
  return user;
};

// Login
export const login = async ({ email, password }, issuer) => {
  const user = await findOne({
    model: UserModel,
    query: { email, provider: ProviderEnum.SYSTEM },
  });

  // Login with Gmail and try to Login with System
  if (!user) NotFoundException({ message: "Invalid Login Credentials" });

  const match = await compare(password, user.password);
  if (!match) NotFoundException({ message: "Invalid Login Credentials" });

  return await createLoginCredentials({
    payload: {
      sub: user._id,
      role: user.role,
    },
    options: { issuer },
  });
};


