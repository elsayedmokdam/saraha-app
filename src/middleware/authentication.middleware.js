// -----------    COMMONS    -----------
import { $CACHE_SERVICES } from "../common/services/index.js";
import { $ENUMS } from "../common/enum/index.js";
import { $EXCEPTIONS } from "../common/exceptions/index.js";
import { $SECURITY } from "../common/security/index.js";
import { $UTILS } from "../common/utils/index.js";
// -----------    COMMONS    -----------
// ----------- DESTRUCTURING -----------
const { UnauthorizedException } = $EXCEPTIONS;
const { decodeToken, basicAuth } = $SECURITY;
const { TokenTypeEnum } = $ENUMS;
const { exists, get, update, set } = $CACHE_SERVICES;
const { userCacheProfileKeyFormat } = $UTILS;
// ----------- DESTRUCTURING -----------

export const authenticationMiddleware = (tokenType = TokenTypeEnum.ACCESS) => {
  return async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
      throw UnauthorizedException({ message: "Unauthorized" });
    }
    const [key, credentials] = authorization.split(" ");
    switch (key) {
      case "Bearer":
        const { payload, user } = await decodeToken({
          authorization: credentials,
          tokenType,
        });
        const cacheKey = userCacheProfileKeyFormat({
          userId: user.id,
        });
        if (await exists({ key: cacheKey })) {
          const cachedUser = await get({ key: cacheKey });
          if (cachedUser) {
            req.user = cachedUser;
          } 
        // else {
        //     await update({ key: cacheKey, value: user });
        //     req.user = user;
        //   }
        // } else {
        //   await set({ key: cacheKey, value: user });
        //   req.user = user;
        }
        req.user = user;
        req.payload = payload;
        break;
      case "Basic":
        const [email, password] = Buffer.from(credentials, "base64")
          .toString()
          .split(":");
        req.user = await basicAuth({ email, password });
        break;
      default:
        next(
          new Error("Invalid Authentication Schema", {
            cause: { status: 400 },
          }),
        );
        break;
    }
    next();
  };
};
