export const userCacheProfileKeyFormat = ({ userId }) => {
  return `User::${userId.toString()}::profile`;
};
