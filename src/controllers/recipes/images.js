const { StatusCodes } = require('http-status-codes');
const recipeServices = require('../../services/recipes');
const errorTypes = require('../../utils/errorTypes');

module.exports = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { filename } = req.file;
    const { _id: userId, role } = req.user;

    if (!filename) return next(errorTypes.unsentFile);

    const updatedRecipe = await recipeServices
      .images({ id, userId, role, filename });

    if (updatedRecipe.message) return next(updatedRecipe);

    return res.status(StatusCodes.OK).json(updatedRecipe);
  } catch (error) {
    return next(error);
  }
};
