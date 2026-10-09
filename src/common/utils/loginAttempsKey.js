export const maxLoginAttempsKeyFormat = ({ email }) =>
  `User::${email}::MaxLoginAttemps`;
