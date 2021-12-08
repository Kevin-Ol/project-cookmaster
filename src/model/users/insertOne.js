const connection = require('../connection');

module.exports = async (user) => {
  const db = await connection();
  await db.collection('users').insertOne(user);
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
