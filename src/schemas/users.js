const Joi = require('joi');

const INVALID_ENTRIES = 'Invalid entries. Try again.';
module.exports = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).allow('admin').required(),
}).messages({
  'string.base': INVALID_ENTRIES,
  'string.empty': INVALID_ENTRIES,
  'any.required': INVALID_ENTRIES,
  'string.email': INVALID_ENTRIES,
  'string.min': INVALID_ENTRIES,
});

// Fonte de como personalizar mensagens no Joi
// https://stackoverflow.com/questions/48720942/node-js-joi-how-to-display-a-custom-error-messages
