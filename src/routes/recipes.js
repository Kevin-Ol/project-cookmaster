const { Router } = require('express');
const middlewares = require('../middlewares');
const controllers = require('../controllers/recipes');

const recipesRoutes = Router();

recipesRoutes.get('/:id', controllers.getById);

recipesRoutes.get('/', controllers.getAll);

recipesRoutes.post('/', middlewares.jwtAuth, controllers.create);

recipesRoutes.put('/:id', middlewares.jwtAuth, controllers.update);

recipesRoutes.put('/:id/image', middlewares.jwtAuth, middlewares.multer.single('image'),
  controllers.images);

recipesRoutes.delete('/:id', middlewares.jwtAuth, controllers.remove);

module.exports = recipesRoutes;
