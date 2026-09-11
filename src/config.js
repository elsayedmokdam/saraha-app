import { config } from "dotenv";
import { resolve } from "node:path";

export const NODE_ENV = process.env.NODE_ENV ?? "development";
config({ path: resolve(`.env.${NODE_ENV}`) });

export const PORT = parseInt(process.env.PORT ?? "3000");
export const DB_URI = process.env.DB_URI ?? "mongodb://localhost:27017/";
export const ENC_KEY = process.env.ENC_KEY ?? "secret";
export const IV_LENGTH = parseInt(process.env.IV_LENGTH ?? "16");
