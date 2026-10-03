import jwt from "jsonwebtoken";
import {
  ACCESS_ADMIN_TOKEN_SIGNATURE,
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_USER_TOKEN_SIGNATURE,
  REFRESH_ADMIN_TOKEN_SIGNATURE,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_USER_TOKEN_SIGNATURE,
} from "../../config.js";
import { compare } from "./hash.security.js";
import { randomUUID } from "node:crypto";
// -----------    COMMONS    -----------
import { $EXCEPTIONS } from "../exceptions/index.js";
import { $REPOSITORIES } from "../repository/index.js";
import { $MODELS } from "../../DB/models/index.js";
import { $ENUMS } from "../enum/index.js";
import { $CACHE_SERVICES } from "../services/index.js";
import { $UTILS } from "../utils/index.js";
// -----------    COMMONS    -----------
// ----------- DESTRUCTURING -----------
const { BadRequestException, UnauthorizedException, NotFoundException } =
  $EXCEPTIONS;
const { findById, findOne } = $REPOSITORIES;
const { UserModel } = $MODELS;
const { TokenTypeEnum, RoleEnum } = $ENUMS;
const { userRevokeTokenKeyFormat, userCacheProfileKeyFormat } = $UTILS;
const { exists, set, get } = $CACHE_SERVICES;

// ----------- DESTRUCTURING -----------

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

  const revoked = await exists({
    key: userRevokeTokenKeyFormat({
      userId: payload.sub,
      jti: payload.jti,
    }),
  });

  if (revoked) {
    throw UnauthorizedException({
      message: "Session Expired, Please Login Again",
    });
  }
  if (await exists({ key: userCacheProfileKeyFormat({ userId: payload.sub }) })) {
    const cachedUser = await get({
      key: userCacheProfileKeyFormat({ userId: payload.sub }),
    });
    if (cachedUser) {
      return { payload, user: cachedUser };
    }
  }
  
  const user = await findById({ model: UserModel, id: payload.sub });
  if (!user) {
    throw UnauthorizedException({
      message: "Session Expired, Please Login Again",
    });
  }

  await set({
    key: userCacheProfileKeyFormat({ userId: payload.sub }),
    value: user,
    ttl: ACCESS_TOKEN_EXPIRES_IN,
  });

  // Logout from all devices, then the user.changeCredentialsTime will be updated to the current time, and the payload.iat will be less than the user.changeCredentialsTime, so the token will be invalid
  if ((user.changeCredentialsTime?.getTime() ?? 0) > payload.iat * 1000) {
    throw UnauthorizedException({
      message: "Session Expired, Please Login Again",
    });
  }

  return { payload, user };
};

export const createLoginCredentials = async ({
  payload = {},
  options = {},
} = {}) => {
  const jwtId = randomUUID();
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
        jti: jwtId,
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
        jti: jwtId,
      },
      options: {
        ...options,
        audience: [payload.role],
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      },
      secret: refreshSignature,
    }),
  ]);
  return {
    access_token,
    refresh_token,
  };
};

export const createRevokeToken = async ({ payload }) => {
  // payload.iat => iat of the access token, and it is equal to iat of the refresh token, because both tokens are generated at the same time
  const consumedTime = Date.now() / 1000 - payload.iat;
  const refreshExpiresIn = payload.iat + REFRESH_TOKEN_EXPIRES_IN;
  const ttl = refreshExpiresIn - consumedTime;
  // console.log("expiresIn", consumedTime + ttl);
  await set({
    key: userRevokeTokenKeyFormat({
      userId: payload.sub,
      jti: payload.jti,
    }),
    value: payload.jti,
    options: { EX: ttl },
  });
  return;
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
