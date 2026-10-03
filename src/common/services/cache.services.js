import { client } from "../../DB/redis.connection.js";

export const set = async ({ key, value, ttl = undefined } = {}) => {
  if (typeof value === "object") {
    value = JSON.stringify(value);
  }
  return await client.set(key, value, { EX: ttl });
};

export const get = async ({ key }) => {
  let value = await client.get(key);
  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
};

export const exists = async ({ key }) => {
  return await client.exists(key);
};

export const update = async ({ key, value, ttl = undefined } = {}) => {
  if (!(await exists({ key }))) return 0;
  await client.set(key, value, { EX: ttl });
};

export const del = async ({ key }) => {
  return await client.del(key);
};

// Get all keys with a specific prefix
export const keys = async ({ prefix }) => {
  return await client.keys(`${prefix}*`);
};

// Get the time-to-live (TTL) of a key in seconds
export const ttl = async ({ key }) => {
  return await client.ttl(key);
};

// Set the time-to-live (TTL) of a key in seconds
export const expire = async ({ key, ttl }) => {
  return await client.expire(key, ttl);
};
