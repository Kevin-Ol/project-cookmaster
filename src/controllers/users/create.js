const { StatusCodes } = require('http-status-codes');
const schemas = require('../../schemas');
const userServices = require('../../services/users');

module.exports = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const { error } = schemas.users.validate({ name, email, password });
    if (error) {
      error.code = StatusCodes.BAD_REQUEST;
      return next(error);
    }
  
    const user = await userServices.create({ name, email, password });
  
    if (user.message) return next(user);
  
    return res.status(StatusCodes.CREATED).json({ user });
  } catch (error) {
    return next(error);
  }
};
