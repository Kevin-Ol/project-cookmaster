const jwt = require('jsonwebtoken');
const errorTypes = require('../utils/errorTypes');

const secret = 'expostoParaFinsDidaticos';

module.exports = async (req, _res, next) => {
  const { authorization } = req.headers;
  if (!authorization) return next(errorTypes.missingJWT);

  try {
    const { data } = jwt.verify(authorization, secret);
    req.user = data;
    return next();
  } catch (error) {
    return next(errorTypes.invalidJWT);
  }
};
