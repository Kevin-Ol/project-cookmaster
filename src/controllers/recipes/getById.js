const { StatusCodes } = require('http-status-codes');
const recipeServices = require('../../services/recipes');

module.exports = async (req, res, next) => {
  try {
    const { id } = req.params;

    const recipe = await recipeServices.getById(id);

    if (recipe.message) return next(recipe);
  
    return res.status(StatusCodes.OK).json(recipe);
  } catch (error) {
    return next(error);
  }
};
