const recipesModel = require('../../model/recipes');
const errorTypes = require('../../utils/errorTypes');

module.exports = async ({ id, userId, role }) => {
  const recipe = await recipesModel.getById(id);
  
  if (!recipe) return errorTypes.recipeNotFound;

  if (role === 'user' && recipe.userId !== userId) return errorTypes.unauthorizedDelete;

  const removedRecipe = await recipesModel.remove(id);

  return removedRecipe;
};
