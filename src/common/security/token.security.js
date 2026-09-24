import jwt from "jsonwebtoken";
import {
  ACCESS_ADMIN_TOKEN_SIGNATURE,
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_USER_TOKEN_SIGNATURE,
  REFRESH_ADMIN_TOKEN_SIGNATURE,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_USER_TOKEN_SIGNATURE,
} from "../../config.js";
import { $EXCEPTIONS } from "../exceptions/index.js";
import { $REPOSITORIES } from "../repository/index.js";
import { $MODELS } from "../../DB/models/index.js";
import { $ENUMS } from "../enum/index.js";
import { compare } from "./hash.security.js";
const { BadRequestException, UnauthorizedException, NotFoundException } =
  $EXCEPTIONS;
const { findById, findOne } = $REPOSITORIES;
const { UserModel } = $MODELS;
const { TokenTypeEnum, RoleEnum } = $ENUMS;

export const generateToken = async ({
  payload = {},
  secret = ACCESS_USER_TOKEN_SIGNATURE,
  options = {},
} = {}) => {
  return jwt.sign(payload, secret, options);
};

export const verifyToken = async ({
  token = "",
  secret = ACCESS_USER_TOKEN_SIGNATURE,
} = {}) => {
  return jwt.verify(token, secret);
};

const getTokenSignatures = async ({
  TokenType = TokenTypeEnum.ACCESS,
  role = RoleEnum.USER,
} = {}) => {
  let signatures = {};
  switch (role) {
    case RoleEnum.ADMIN:
      signatures = {
        [TokenTypeEnum.ACCESS]: ACCESS_ADMIN_TOKEN_SIGNATURE,
        [TokenTypeEnum.REFRESH]: REFRESH_ADMIN_TOKEN_SIGNATURE,
      };
      break;
    default:
      signatures = {
        [TokenTypeEnum.ACCESS]: ACCESS_USER_TOKEN_SIGNATURE,
        [TokenTypeEnum.REFRESH]: REFRESH_USER_TOKEN_SIGNATURE,
      };
      break;
  }
  return signatures[TokenType];
};

export const decodeToken = async ({
  authorization = "",
  tokenType = TokenTypeEnum.ACCESS,
} = {}) => {
  const decoded = jwt.decode(authorization);
  if (!decoded?.aud?.length) {
    throw BadRequestException({ message: "Missing Token Payload" });
  }

  const payload = await verifyToken({
    token: authorization,
    secret: await getTokenSignatures({
      TokenType: tokenType,
      role: decoded.aud[0],
    }),
  });

  if (!payload?.sub) {
    throw BadRequestException({ message: "Missing Token Payload" });
  }

  const user = await findById({ model: UserModel, id: payload.sub });
  if (!user) {
    throw UnauthorizedException({ message: "Invalid Token" });
  }
  return { payload, user };
};

export const createLoginCredentials = async ({
  payload = {},
  options = {},
} = {}) => {
  const [accessSignature, refreshSignature] = await Promise.all([
    getTokenSignatures({
      TokenType: TokenTypeEnum.ACCESS,
      role: payload.role,
    }),
    getTokenSignatures({
      TokenType: TokenTypeEnum.REFRESH,
      role: payload.role,
    }),
  ]);
  const [access_token, refresh_token] = await Promise.all([
    generateToken({
      payload: {
        sub: payload.sub,
        role: payload.role,
      },
      options: {
        ...options,
        audience: [payload.role],
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      },
      secret: accessSignature,
    }),
    generateToken({
      payload: {
        sub: payload.sub,
        role: payload.role,
      },
      options: {
        ...options,
        audience: [payload.role],
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      },
      secret: refreshSignature,
    }),
  ]);
  // console.log({ access_token, refresh_token });
  return {
    access_token,
    refresh_token,
  };
};

export const basicAuth = async ({ email, password }) => {
  const user = await findOne({
    model: UserModel,
    query: { email },
  });

  const match = await compare(password, user.password);
  if (!match) NotFoundException({ message: "Invalid Login Credentials" });

  return user;
};
