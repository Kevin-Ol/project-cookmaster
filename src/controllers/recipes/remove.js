const { StatusCodes } = require('http-status-codes');
const recipeServices = require('../../services/recipes');

module.exports = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { _id: userId, role } = req.user;
  
    const updatedRecipe = await recipeServices.remove({ id, userId, role });

    if (updatedRecipe.message) return next(updatedRecipe);

    return res.status(StatusCodes.NO_CONTENT).end();
  } catch (error) {
    return next(error);
  }
};
