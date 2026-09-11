export const AppException = ({
  message = "Internal Server Error",
  options = {
    cause: { status: 500 },
  },
} = {}) => {
  throw new Error(message, options);
};

export const ConflictException = ({
  message = "Conflict",
  issues = {},
} = {}) => {
  return AppException({
    message,
    options: { cause: { status: 409, issues } },
  });
};

export const NotFoundException = ({
  message = "Not Found",
  issues = {},
} = {}) => {
  return AppException({
    message,
    options: { cause: { status: 404, issues } },
  });
};

export const BadRequestException = ({
  message = "Bad Request",
  issues = {},
} = {}) => {
  return AppException({
    message,
    options: { cause: { status: 400, issues } },
  });
};

export const UnauthorizedException = ({
  message = "Unauthorized",
  issues = {},
} = {}) => {
  return AppException({
    message,
    options: { cause: { status: 401, issues } },
  });
};

export const ForbiddenException = ({
  message = "Forbidden",
  issues = {},
} = {}) => {
  return AppException({
    message,
    options: { cause: { status: 403, issues } },
  });
};
