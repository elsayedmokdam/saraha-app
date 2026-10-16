import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import geoip from "geoip-lite";
import { client } from "../../DB/redis.connection.js";
import { RedisStore } from "rate-limit-redis";

async function detectLocation(ip) {
  try {
    const location = geoip.lookup(ip);
    return location;
  } catch (error) {
    console.log(`Failed to get location from ip: ${ip} ❌ ${error}`);
  }
}

export const generateRateLimiter = ({
  ttl = 5,
  limit = 100,
  message = "Too Many Requests",
  options = {},
} = {}) => {
  return rateLimit({
    windowMs: 1000 * 60 * ttl,
    standardHeaders: "draft-8",
    legacyHeaders: true,
    ...options,

    limit: async function (req) {
      const { country } = (await detectLocation(req.ip)) || {};
      return country === "EG" ? limit : 0;
    },

    keyGenerator: function (req) {
      // Allow only the version of IPv4
      const ip = ipKeyGenerator(req.ip, 52);
      return `${ip}::${req.path}`;
    },

    handler: function (req, res, next) {
      return res.status(429).json({ message, status: 429 });
    },

    // store in redis using rate-limit-redis library
    store: new RedisStore({
      sendCommand: (...args) => client.sendCommand(args),
    }),

    /* store: {
      // key => what returned from keyGenerator
      // Called by `keyGenerator` and store the key with its expiration time in redis.
      async incr(key, cb) {
        try {
          const count = await client.incr(key);
          if (count === 1) await client.expire(key, 60);
          cb(null, count);
        } catch (error) {
          cb(error);
        }
      },

      // Called by `keyGenerator` and store the key with its expiration time in redis.
      // Called when skipSuccessfulRequest option in limiter = true or skipFailedRequest option in limiter = true
      async decr(key) {
        if (await client.exists(key)) await client.decr(key);
      },
    }, */
  });
};
