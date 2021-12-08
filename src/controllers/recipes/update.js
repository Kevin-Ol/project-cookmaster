const { StatusCodes } = require('http-status-codes');
const schemas = require('../../schemas');
const recipeServices = require('../../services/recipes');

module.exports = async (req, res, next) => {
  try {
    const { name, ingredients, preparation } = req.body;
    const { id } = req.params;
    const { _id: userId, role } = req.user;

    const { error } = schemas.recipes.validate(req.body);

    if (error) {
      error.code = StatusCodes.BAD_REQUEST;
      return next(error);
    }
  
    const updatedRecipe = await recipeServices
      .update({ id, name, ingredients, preparation, userId, role });

    if (updatedRecipe.message) return next(updatedRecipe);

    return res.status(StatusCodes.OK).json(updatedRecipe);
  } catch (error) {
    return next(error);
  }
};
