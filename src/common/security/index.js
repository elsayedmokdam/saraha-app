import { decryption, encryption } from "./encryption.security.js";
import { compare, hash } from "./hash.security.js";
import {
  basicAuth,
  createLoginCredentials,
  createRevokeToken,
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
  createRevokeToken,
};
