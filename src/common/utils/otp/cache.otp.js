export const userCacheOTPKeyFormat = ({ email, enumType }) =>
  `User::${email}::${enumType}::OTP`;

export const userCacheOTPTrialsKeyFormat = ({ email, enumType }) =>
  `${userCacheOTPKeyFormat({ email, enumType })}::Trials`;
