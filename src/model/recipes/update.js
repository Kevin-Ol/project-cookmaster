const { ObjectId } = require('mongodb');
const connection = require('../connection');

module.exports = async (id, fields) => {
  const db = await connection();
  const { value: updatedRecipe } = await db.collection('recipes').findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: fields },
    { returnOriginal: false },
  );
  return updatedRecipe;
};
