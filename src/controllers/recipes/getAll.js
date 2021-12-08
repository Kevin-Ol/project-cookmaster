const { StatusCodes } = require('http-status-codes');
const recipeServices = require('../../services/recipes');

module.exports = async (_req, res, next) => {
  try {
    const recipes = await recipeServices.getAll();
  
    return res.status(StatusCodes.OK).json(recipes);
  } catch (error) {
    return next(error);
  }
};
