const recipesModel = require('../../model/recipes');
const errorTypes = require('../../utils/errorTypes');

module.exports = async ({ id, name, ingredients, preparation, userId, role }) => {
  const recipe = await recipesModel.getById(id);
  
  if (!recipe) return errorTypes.recipeNotFound;

  if (role === 'user' && recipe.userId !== userId) return errorTypes.unauthorizedUpdate;

  const updatedRecipe = await recipesModel.update(id, { name, ingredients, preparation });

  return updatedRecipe;
};
