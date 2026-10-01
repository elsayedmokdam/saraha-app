import { del, exists, expire, get, keys, set, ttl, update } from "./cache.services.js";

export const $CACHE_SERVICES = {
  set,
  get,
  exists,
  update,
  del,
  keys,
  ttl,
  expire,
};
