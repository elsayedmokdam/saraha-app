export const userBaseRevokeTokenKeyFormat = ({ userId }) => {
  return `User::${userId.toString()}::revoke_token`;
};

export const userRevokeTokenKeyFormat = ({ userId, jti }) => {
  return `${userBaseRevokeTokenKeyFormat({ userId })}::${jti}`;
};
