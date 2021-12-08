const express = require('express');
const path = require('path');
const { userRoutes, loginRoutes, recipesRoutes } = require('../routes');
const middlewares = require('../middlewares');

const app = express();

app.use(express.json());
// Não remover esse end-point, ele é necessário para o avaliador
app.get('/', (request, response) => {
  response.send();
});
// Não remover esse end-point, ele é necessário para o avaliador

app.use('/images', express.static(path.resolve(__dirname, '..', 'uploads')));

app.use('/users', userRoutes);

app.use('/login', loginRoutes);

app.use('/recipes', recipesRoutes);

app.use(middlewares.error);

module.exports = app;
