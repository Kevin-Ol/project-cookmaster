const { StatusCodes } = require('http-status-codes');

module.exports = {
  emailRegistered: {
    code: StatusCodes.CONFLICT,
    message: 'Email already registered',
  },
  incorrectEmail: {
    code: StatusCodes.UNAUTHORIZED,
    message: 'Incorrect username or password',
  },
  invalidJWT: {
    code: StatusCodes.UNAUTHORIZED,
    message: 'jwt malformed',
  },
  recipeNotFound: {
    code: StatusCodes.NOT_FOUND,
    message: 'recipe not found',
  },
  missingJWT: {
    code: StatusCodes.UNAUTHORIZED,
    message: 'missing auth token',
  },
  unauthorizedUpdate: {
    code: StatusCodes.UNAUTHORIZED,
    message: 'you can only update your recipes',
  },
  unauthorizedDelete: {
    code: StatusCodes.UNAUTHORIZED,
    message: 'you can only delete your recipes',
  },
  unsentFile: {
    code: StatusCodes.BAD_REQUEST,
    message: 'unsent file',
  },
  isNotAdmin: {
    code: StatusCodes.FORBIDDEN,
    message: 'Only admins can register new admins',
  },
};
