import { OAuth2Client } from "google-auth-library";
import { WEB_CLIENT_IDs } from "../../config.js";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../common/exceptions/index.js";
import { create, findOne } from "../../common/repository/index.js";
import { UserModel } from "../../DB/models/index.js";
import {
  compare,
  createLoginCredentials,
  encryption,
  hash,
} from "../../common/security/index.js";
import {
  EmailSubjectEnum,
  ProviderEnum,
  RoleEnum,
} from "../../common/enum/index.js";
import {
  sendEmailOTP,
  userBaseRevokeTokenKeyFormat,
  userCacheOTPKeyFormat,
  userCacheProfileKeyFormat,
} from "../../common/utils/index.js";
import { del, get, keys } from "../../common/services/index.js";

const client = new OAuth2Client();
async function verifyGoogleIDToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: WEB_CLIENT_IDs,
  });

  const payload = ticket.getPayload();
  if (!payload?.email_verified) {
    throw BadRequestException({ message: "Email not verified" });
  }
  return payload;
}

// Signup with Gmail
export const signupWithGmail = async ({ idToken }, issuer) => {
  // console.log({ idToken });
  const { name, email, picture } = await verifyGoogleIDToken(idToken);
  const existAccount = await findOne({
    model: UserModel,
    query: { email },
  });

  if (existAccount) {
    // 1. Exist and Provider is not Google, then Conflict
    if (existAccount.provider !== ProviderEnum.GOOGLE) {
      throw ConflictException({ message: "Invalid Account Provider" });
    }
    // 2. Exist and Provider is Google, then Login
    return {
      status: 200,
      message: "Login Successful",
      data: await createLoginCredentials({
        payload: {
          sub: existAccount._id,
          role: existAccount.role,
        },
        options: { issuer },
      }),
    };
  }

  // 3. Not Exist, then Signup with Gmail
  const user = await create({
    model: UserModel,
    data: [
      {
        username: name,
        email,
        confirmEmail: Date.now(),
        image: picture,
        provider: ProviderEnum.GOOGLE,
        role: RoleEnum.USER,
      },
    ],
  });

  return {
    status: 201,
    message: "Signup Successful",
    data: await createLoginCredentials({
      payload: {
        sub: user._id,
        role: user.role,
      },
      options: { issuer },
    }),
  };
};

// Signup
export const signup = async (inputs) => {
  const checkDuplicate = await findOne({
    model: UserModel,
    query: { email: inputs.email },
  });
  if (checkDuplicate)
    throw ConflictException({ message: "Email Already Exists" });
  const user = await create({
    model: UserModel,
    data: [
      {
        ...inputs,
        password: await hash(inputs.password),
        confirmPassword: await hash(inputs.confirmPassword),
        phone: await encryption(inputs.phone),
      },
    ],
    options: { validateBeforeSave: true },
  });

  await sendEmailOTP({
    email: inputs.email,
    subject: EmailSubjectEnum.CONFIRM_EMAIL,
  });
  return user;
};

// Login
export const login = async ({ email, password }, issuer) => {
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
    throw NotFoundException({ message: "Please Confirm Email First to Login" });

  // Check Password
  const match = await compare(password, user.password);
  if (!match) throw NotFoundException({ message: "Invalid Login Credentials" });

  return await createLoginCredentials({
    payload: {
      sub: user._id,
      role: user.role,
    },
    options: { issuer },
  });
};

// Confirm Email
export const confirmEmail = async ({ email, otp }) => {
  const user = await findOne({
    model: UserModel,
    query: {
      email,
      provider: ProviderEnum.SYSTEM,
      // confirmEmail: { $exists: false },
    },
  });
  // If User Not Found
  if (!user) throw NotFoundException({ message: "Invalid Login Credentials" });

  // If User Email Already Confirmed
  if (user.confirmEmail)
    throw NotFoundException({ message: "Email Already Confirmed" });

  const cacheCode = await get({
    key: userCacheOTPKeyFormat({
      email: user.email,
      enumType: EmailSubjectEnum.CONFIRM_EMAIL,
    }),
  });
  if (!cacheCode || !(await compare(otp, cacheCode)))
    throw NotFoundException({ message: "Invalid OTP, Ask for Resend" });

  user.confirmEmail = Date.now();
  await user.save();

  // Delete Cached OTP
  await del({
    key: await keys({
      prefix: userCacheOTPKeyFormat({
        email: user.email,
        enumType: EmailSubjectEnum.CONFIRM_EMAIL,
      }),
    }),
  });
  return user;
};

// Resend Confirm Email OTP
export const resendConfirmEmailOTP = async ({ email }) => {
  const user = await findOne({
    model: UserModel,
    query: {
      email,
      provider: ProviderEnum.SYSTEM,
      // confirmEmail: { $exists: false },
    },
  });
  // If User Not Found
  if (!user) throw NotFoundException({ message: "Invalid Login Credentials" });

  // If User Email Already Confirmed
  if (user.confirmEmail)
    throw NotFoundException({ message: "Email Already Confirmed" });

  await sendEmailOTP({
    email: user.email,
    subject: EmailSubjectEnum.CONFIRM_EMAIL,
  });
  return "OTP Sent Successfully";
};

export const forgotPassword = async ({ email }) => {
  const user = await findOne({
    model: UserModel,
    query: {
      email,
      provider: ProviderEnum.SYSTEM,
      // confirmEmail: { $exists: true },
    },
  });
  // If User Not Found
  if (!user) throw NotFoundException({ message: "Invalid Email" });

  // If User Email Not Confirmed
  if (!user.confirmEmail)
    throw NotFoundException({ message: "Please Confirm Email First" });

  await sendEmailOTP({
    email: user.email,
    subject: EmailSubjectEnum.FORGOT_PASSWORD,
  });
  return "OTP Sent Successfully";
};

export const verifyResetPasswordOTP = async ({ email, otp }) => {
  const user = await findOne({
    model: UserModel,
    query: {
      email,
      provider: ProviderEnum.SYSTEM,
      // confirmEmail: { $exists: true },
    },
  });
  // If User Not Found
  if (!user) throw NotFoundException({ message: "Invalid Email" });

  // If User Email Not Confirmed
  if (!user.confirmEmail)
    throw NotFoundException({ message: "Please Confirm Email First" });

  const cacheCode = await get({
    key: userCacheOTPKeyFormat({
      email: user.email,
      enumType: EmailSubjectEnum.FORGOT_PASSWORD,
    }),
  });

  if (!cacheCode || !(await compare(otp, cacheCode)))
    throw NotFoundException({ message: "Invalid OTP, Ask for Resend" });
  return {
    user,
    message: "OTP Verified Successfully",
  };
};

export const resetPassword = async ({
  email,
  newPassword,
  confirmPassword,
  otp,
}) => {
  const { user } = await verifyResetPasswordOTP({ email, otp });
  user.password = await hash(newPassword);
  user.confirmPassword = await hash(confirmPassword);
  // To Logout User From All Devices
  user.changeCredentialsTime = Date.now();
  await user.save();

  // Delete Cached OTP
  await del({
    key: await keys({
      prefix: userCacheOTPKeyFormat({
        email: user.email,
        enumType: EmailSubjectEnum.FORGOT_PASSWORD,
      }),
    }),
  });

  // Delete Cached Revoked Token Keys
  await del({
    key: await keys({
      prefix: userBaseRevokeTokenKeyFormat({
        userId: user._id,
      }),
    }),
  });

  // Delete Cached User Profile
  await del({
    key: userCacheProfileKeyFormat({
      userId: user._id,
    }),
  });
  return {
    user,
    message:
      "Password Reset Successfully, Please Login Again With New Password",
  };
};
