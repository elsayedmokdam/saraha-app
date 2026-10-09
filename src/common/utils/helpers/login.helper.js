import { TWO_FA_EXPIRESIN } from "../../../config.js";
import { UserModel } from "../../../DB/models/index.js";
import { EmailSubjectEnum, ProviderEnum } from "../../enum/index.js";
import { NotFoundException } from "../../exceptions/index.js";
import { findOne } from "../../repository/index.js";
import { compare, createLoginCredentials } from "../../security/index.js";
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

  // Login with Gmail and try to Login with System
  if (!user) throw NotFoundException({ message: "Invalid Login Credentials" });

  // Login with System But Email Not Confirmed
  if (!user.confirmEmail)
    throw NotFoundException({
      message: "Please Confirm Email First to Login",
    });

  // Check Password
  const match = await compare(password, user.password);
  if (!match) throw NotFoundException({ message: "Invalid Login Credentials" });

  switch (FA) {
    case true:
      const OTP = createOTP();
      await sendEmailOTP({
        email: user.email,
        subject: EmailSubjectEnum.TWO_STEP_VERIFICATION,
        otp: OTP,
        expiresIn: TWO_FA_EXPIRESIN,
      });
      break;
    default:
      return await createLoginCredentials({
        payload: {
          sub: user._id,
          role: user.role,
        },
        options: { issuer },
      });
  }
};
