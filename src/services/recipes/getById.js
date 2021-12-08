const { ObjectId } = require('mongodb');
const recipesModel = require('../../model/recipes');
const errorTypes = require('../../utils/errorTypes');

module.exports = async (id) => {
  if (!ObjectId.isValid(id)) return errorTypes.recipeNotFound; 

  const recipe = await recipesModel.getById(id);

  if (!recipe) return errorTypes.recipeNotFound; 

  return recipe;
};
