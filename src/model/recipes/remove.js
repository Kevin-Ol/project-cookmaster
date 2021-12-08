const { ObjectId } = require('mongodb');
const connection = require('../connection');

module.exports = async (id) => {
  const db = await connection();
  const { value: deletedRecipe } = await db.collection('recipes').findOneAndDelete(
    { _id: ObjectId(id) },
  );
  return deletedRecipe;
};
