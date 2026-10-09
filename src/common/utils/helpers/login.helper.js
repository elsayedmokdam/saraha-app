import {
  LOGIN_ATTEMPT_BLOCK_TIME,
  MAX_LOGIN_ATTEMPTS_TRIALS,
  TWO_FA_EXPIRESIN,
} from "../../../config.js";
import { UserModel } from "../../../DB/models/index.js";
import { EmailSubjectEnum, ProviderEnum } from "../../enum/index.js";
import { NotFoundException } from "../../exceptions/index.js";
import { findOne } from "../../repository/index.js";
import { compare, createLoginCredentials } from "../../security/index.js";
import { del, expire, get, set, ttl } from "../../services/index.js";
import { maxLoginAttempsKeyFormat } from "../loginAttempsKey.js";
import { createOTP } from "../otp/create.otp.js";
import { sendEmailOTP } from "../otp/send.otp.js";

export const loginHelper = async ({ email, password }, issuer, FA = false) => {
  const user = await findOne({
    model: UserModel,
    query: {
      email,
      provider: ProviderEnum.SYSTEM,
      // confirmEmail: { $exists: true },
    },
  });
  const loginAttemps = await get({ key: maxLoginAttempsKeyFormat({ email }) });

  if ((await ttl({ key: maxLoginAttempsKeyFormat({ email }) })) > 0) {
    throw NotFoundException({
      message: `Invalid Login Credentials, Please try again after ${LOGIN_ATTEMPT_BLOCK_TIME / 60 > 1 ? LOGIN_ATTEMPT_BLOCK_TIME / 60 : LOGIN_ATTEMPT_BLOCK_TIME} ${LOGIN_ATTEMPT_BLOCK_TIME / 60 > 1 ? "minutes" : "seconds"}`,
    });
  }

  if (!user) {
    // Login with Gmail and try to Login with System
    await set({
      key: maxLoginAttempsKeyFormat({ email }),
      value: 1 + loginAttemps,
    });
    if (loginAttemps >= MAX_LOGIN_ATTEMPTS_TRIALS) {
      await expire({
        key: maxLoginAttempsKeyFormat({ email }),
        ttl: LOGIN_ATTEMPT_BLOCK_TIME,
      });
    }
    throw NotFoundException({ message: "Invalid Login Credentials" });
  }

  // Login with System But Email Not Confirmed
  if (!user.confirmEmail)
    throw NotFoundException({
      message: "Please Confirm Email First to Login",
    });

  // Check Password
  const match = await compare(password, user.password);
  if (!match) {
    await set({
      key: maxLoginAttempsKeyFormat({ email }),
      value: 1 + loginAttemps,
    });
    if (loginAttemps >= MAX_LOGIN_ATTEMPTS_TRIALS) {
      console.log("Blocked");
      await expire({
        key: maxLoginAttempsKeyFormat({ email }),
        ttl: LOGIN_ATTEMPT_BLOCK_TIME,
      });
    }
    throw NotFoundException({ message: "Invalid Login Credentials" });
  }

  switch (FA) {
    case true:
      const OTP = createOTP();
      await sendEmailOTP({
        email: user.email,
        subject: EmailSubjectEnum.TWO_STEP_VERIFICATION,
        otp: OTP,
        expiresIn: TWO_FA_EXPIRESIN,
      });
      await del({ key: maxLoginAttempsKeyFormat({ email }) });
      break;
    default:
      await del({ key: maxLoginAttempsKeyFormat({ email }) });
      return await createLoginCredentials({
        payload: {
          sub: user._id,
          role: user.role,
        },
        options: { issuer },
      });
  }
};
