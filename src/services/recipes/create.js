const recipesModel = require('../../model/recipes');

module.exports = async ({ name, ingredients, preparation, userId }) => {
  const insertedRecipe = await recipesModel.insertOne({ name, ingredients, preparation, userId });

  return insertedRecipe;
};
