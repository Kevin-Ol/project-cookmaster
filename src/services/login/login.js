const jwt = require('jsonwebtoken');
const usersModel = require('../../model/users');
const errorTypes = require('../../utils/errorTypes');

const secret = 'expostoParaFinsDidaticos';

const jwtConfig = {
  expiresIn: '1d',
  algorithm: 'HS256',
};

module.exports = async ({ email, password }) => {
  const user = await usersModel.findByEmail(email);

  if (!user) return errorTypes.incorrectEmail;

  if (password !== user.password) return errorTypes.incorrectEmail;
  
  const { password: p, ...userWithoutPassword } = user;

  const token = jwt.sign({ data: userWithoutPassword }, secret, jwtConfig);

  return token;
};
