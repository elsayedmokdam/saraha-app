import { decryption, encryption } from "./encryption.security.js";
import { compare, hash } from "./hash.security.js";

export const $SECURITY = {
  hash,
  compare,
  encryption,
  decryption,
};
