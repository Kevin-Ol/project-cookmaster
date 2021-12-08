const { Router } = require('express');
const login = require('../controllers/login/login');

const loginRoutes = Router();

loginRoutes.post('/', login);

module.exports = loginRoutes;
