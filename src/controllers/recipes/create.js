const { StatusCodes } = require('http-status-codes');
const schemas = require('../../schemas');
const recipeServices = require('../../services/recipes');

module.exports = async (req, res, next) => {
  try {
    const { name, ingredients, preparation } = req.body;
    const { _id: userId } = req.user;

    const { error } = schemas.recipes.validate(req.body);

    if (error) {
      error.code = StatusCodes.BAD_REQUEST;
      return next(error);
    }
  
    const recipe = await recipeServices.create({ name, ingredients, preparation, userId });
  
    return res.status(StatusCodes.CREATED).json({ recipe });
  } catch (error) {
    return next(error);
  }
};
