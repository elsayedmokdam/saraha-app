import { NODE_ENV } from "../config.js";

export const globalErrorHandler = (err, req, res, next) => {
  return res.status(err.cause?.status || 500).json({
    message: err.message || "Internal Server Error",
    status: err?.cause?.status || 500,
    issues: err?.cause?.issues,
    err: NODE_ENV === "development" ? err : undefined,
    stack: NODE_ENV === "development" ? err.stack : undefined,
  });
};
