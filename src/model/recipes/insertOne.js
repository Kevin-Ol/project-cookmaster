const connection = require('../connection');

module.exports = async (recipe) => {
  const db = await connection();
  await db.collection('recipes').insertOne(recipe);
  return recipe;
};
