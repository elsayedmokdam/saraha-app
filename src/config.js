import { config } from "dotenv";
import { resolve } from "node:path";

export const NODE_ENV = process.env.NODE_ENV ?? "development";
config({ path: resolve(`.env.${NODE_ENV}`) });

// Application and Database Configurations
export const PORT = parseInt(process.env.PORT ?? "3000");
export const APP_NAME = process.env.APP_NAME ?? "saraha_app";
export const DB_URI = process.env.DB_URI ?? "mongodb://localhost:27017/";
export const REDIS_URI = process.env.REDIS_URI;
export const ENC_KEY = process.env.ENC_KEY ?? "secret";
export const IV_LENGTH = parseInt(process.env.IV_LENGTH ?? "16");

// Access Token Credentials
export const ACCESS_USER_TOKEN_SIGNATURE = process.env.ACCESS_USER_TOKEN_SIGNATURE;
export const ACCESS_ADMIN_TOKEN_SIGNATURE = process.env.ACCESS_ADMIN_TOKEN_SIGNATURE;
export const ACCESS_TOKEN_EXPIRES_IN = parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN ?? "3600");

// Refresh Token Credentials
export const REFRESH_USER_TOKEN_SIGNATURE = process.env.REFRESH_USER_TOKEN_SIGNATURE;
export const REFRESH_ADMIN_TOKEN_SIGNATURE = process.env.REFRESH_ADMIN_TOKEN_SIGNATURE;
export const REFRESH_TOKEN_EXPIRES_IN = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN ?? "31536000");

// Google Credentials
export const WEB_CLIENT_IDs = process.env.WEB_CLIENT_IDs?.split(",")??[""];

// Mail Credentials
export const APP_EMAIL = process.env.APP_EMAIL;
export const APP_PASSWORD = process.env.APP_PASSWORD;

// OTP
export const OTP_EXPIRES_IN = parseInt(process.env.OTP_EXPIRES_IN ?? "120");
export const OTP_MAX_TRIALS = parseInt(process.env.OTP_MAX_TRIALS ?? "3");
export const OTP_BLOCK_TIME = parseInt(process.env.OTP_BLOCK_TIME ?? "300");
export const TWO_FA_EXPIRESIN = parseInt(process.env.TWO_FA_EXPIRESIN ?? "120");

// Login Attemps
export const MAX_LOGIN_ATTEMPTS_TRIALS = parseInt(process.env.MAX_LOGIN_ATTEMPTS_TRIALS ?? "3");
export const LOGIN_ATTEMPT_BLOCK_TIME = parseInt(process.env.LOGIN_ATTEMPT_BLOCK_TIME ?? "300");