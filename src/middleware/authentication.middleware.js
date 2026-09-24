import { $ENUMS } from "../common/enum/index.js";
import { $EXCEPTIONS } from "../common/exceptions/index.js";
import { $SECURITY } from "../common/security/index.js";

const { UnauthorizedException } = $EXCEPTIONS;
const { decodeToken, basicAuth } = $SECURITY;
const { TokenTypeEnum } = $ENUMS;

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
