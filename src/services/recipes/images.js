const recipesModel = require('../../model/recipes');
const errorTypes = require('../../utils/errorTypes');

module.exports = async ({ id, userId, role, filename }) => {
  const recipe = await recipesModel.getById(id);

  if (!recipe) return errorTypes.recipeNotFound;

  if (role === 'user' && recipe.userId !== userId) return errorTypes.unauthorizedUpdate;

  const updatedRecipe = await recipesModel.update(
    id, { image: `localhost:3000/src/uploads/${filename}` },
  );

  return updatedRecipe;
};
