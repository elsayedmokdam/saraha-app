import { TokenTypeEnum } from "../common/enum/index.js";
import { UnauthorizedException } from "../common/exceptions/index.js";
import { basicAuth, decodeToken } from "../common/security/index.js";

export const bearerAuth = async ({
  req,
  tokenType = TokenTypeEnum.ACCESS,
} = {}) => {
  const [key, credentials] = req.headers["authorization"].split(" ");
  const { payload, user } = await decodeToken({
    authorization: credentials,
    tokenType,
  });
  req.user = user;
  req.payload = payload;
};

export const authenticationMiddleware = (tokenType = TokenTypeEnum.ACCESS) => {
  return async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
      throw UnauthorizedException({ message: "Unauthorized" });
    }
    const [key, credentials] = authorization.split(" ");
    switch (key) {
      case "Bearer":
        await bearerAuth({ req, tokenType });
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
