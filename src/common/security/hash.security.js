import bcrypt from "bcrypt";

export const hash = async (plainText, rounds = 12, minor = "b") => {
  const salt = await bcrypt.genSalt(rounds, minor);
  const hash = await bcrypt.hash(plainText, salt);
  return hash;
};

export const compare = async (plainText, cipherText) => bcrypt.compare(plainText, cipherText); 