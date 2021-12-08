const connection = require('../connection');

module.exports = async (email) => {
  const db = await connection();
  const user = await db.collection('users').findOne({ email });
  return user;
};
