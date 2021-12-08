const usersModel = require('../../model/users');
const errorTypes = require('../../utils/errorTypes');

module.exports = async ({ name, email, password, role }) => {
  if (role !== 'admin') return errorTypes.isNotAdmin;

  const userExists = await usersModel.findByEmail(email);

  if (userExists) return errorTypes.emailRegistered;
  
  const insertedUser = await usersModel.insertOne({ name, email, password, role });

  return insertedUser;
};
