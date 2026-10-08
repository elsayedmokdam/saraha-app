import { createOTP } from "./create.otp.js";
import {
  OTP_BLOCK_TIME,
  OTP_EXPIRES_IN,
  OTP_MAX_TRIALS,
} from "../../../config.js";
import {
  userCacheOTPKeyFormat,
  userCacheOTPTrialsKeyFormat,
} from "./cache.otp.js";
import { expire, get, incrBy, set, ttl } from "../../services/index.js";
import { emailEvent } from "../email/index.js";
import { hash } from "../../security/index.js";
import {
  ConflictException,
  TooManyRequsetException,
} from "../../exceptions/error.exception.js";

export const sendEmailOTP = async ({
  email,
  subject,
  expiresIn = OTP_EXPIRES_IN,
  maxTrials = OTP_MAX_TRIALS,
  blockTime = OTP_BLOCK_TIME,
}) => {
  // Handle existing OTP
  const existOTP_TTL = await ttl({
    key: userCacheOTPKeyFormat({ email, enumType: subject }),
  });
  if (existOTP_TTL > 0)
    throw ConflictException({
      message: `OTP Already Sent, Please check your email as we can't resend OTP after ${existOTP_TTL} seconds`,
    });

  // Handle number of trials by checking it
  const oldTrials = await get({
    key: userCacheOTPTrialsKeyFormat({ email, enumType: subject }),
  });
  if (oldTrials >= maxTrials) {
    throw TooManyRequsetException({
      message: `Maximum number of trials reached, Please try again after ${blockTime / 60 > 1 ? blockTime / 60 : blockTime} ${blockTime / 60 > 1 ? "minutes" : "seconds"}`,
    });
  }

  const data = {
    email,
    code: createOTP(),
  };
  await set({
    key: userCacheOTPKeyFormat({
      email,
      enumType: subject,
    }),
    value: await hash(data.code.toString()),
    ttl: expiresIn,
  });

  // Handle number of trials by incrementing it
  const currentTrials = await incrBy({
    key: userCacheOTPTrialsKeyFormat({ email, enumType: subject }),
  });
  // If the number of trials is greater than or equal to the maximum number of trials, expire the key by setting its TTL to the block time
  if (currentTrials >= maxTrials) {
    await expire({
      key: userCacheOTPTrialsKeyFormat({ email, enumType: subject }),
      ttl: blockTime,
    });
  }

  emailEvent.emit("sendEmail", {
    recipients: {
      to: email,
    },
    subject,
    data,
  });
};
