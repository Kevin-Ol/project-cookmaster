const express = require('express');
const path = require('path');
const { userRoutes, loginRoutes, recipesRoutes } = require('../routes');
const middlewares = require('../middlewares');

const app = express();

app.use(express.json());

app.use('/images', express.static(path.resolve(__dirname, '..', 'uploads')));

app.use('/users', userRoutes);

app.use('/login', loginRoutes);

app.use('/recipes', recipesRoutes);

app.use(middlewares.error);

module.exports = app;
