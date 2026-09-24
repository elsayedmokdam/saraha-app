import { decryption, encryption } from "./encryption.security.js";
import { compare, hash } from "./hash.security.js";
import {
  basicAuth,
  createLoginCredentials,
  decodeToken,
  generateToken,
  verifyToken,
} from "./token.security.js";

export const $SECURITY = {
  hash,
  compare,
  encryption,
  decryption,
  generateToken,
  verifyToken,
  decodeToken,
  createLoginCredentials,
  basicAuth,
};
