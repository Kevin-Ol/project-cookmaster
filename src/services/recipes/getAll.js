const recipesModel = require('../../model/recipes');

module.exports = async () => {
  const recipes = await recipesModel.getAll();

  return recipes;
};
