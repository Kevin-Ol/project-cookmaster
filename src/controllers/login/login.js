const { StatusCodes } = require('http-status-codes');
const schemas = require('../../schemas');
const loginService = require('../../services/login/login');

module.exports = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { error } = schemas.login.validate(req.body);
  
    if (error) {
      error.code = StatusCodes.UNAUTHORIZED;
      return next(error);
    }

    const token = await loginService({ email, password });

    if (token.message) return next(token);

    return res.status(StatusCodes.OK).json({ token });
  } catch (error) {
    return next(error);
  }
};
