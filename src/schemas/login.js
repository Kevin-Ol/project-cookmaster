const Joi = require('joi');

const INCORRECT_FIELDS = 'Incorrect username or password';
const REQUIRED_FIELDS = 'All fields must be filled';

module.exports = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).allow('admin').required(),
}).messages({
  'string.base': INCORRECT_FIELDS,
  'string.empty': REQUIRED_FIELDS,
  'any.required': REQUIRED_FIELDS,
  'string.email': INCORRECT_FIELDS,
  'string.min': INCORRECT_FIELDS,
});

// Fonte de como personalizar mensagens no Joi
// https://stackoverflow.com/questions/48720942/node-js-joi-how-to-display-a-custom-error-messages
