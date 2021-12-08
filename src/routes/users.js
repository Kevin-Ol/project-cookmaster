const { Router } = require('express');
const controllers = require('../controllers/users');
const middlewares = require('../middlewares');

const usersRoutes = Router();

usersRoutes.post('/', controllers.create);

usersRoutes.post('/admin', middlewares.jwtAuth, controllers.admin);

module.exports = usersRoutes;
