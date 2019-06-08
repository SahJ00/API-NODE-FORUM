'use strict'

// Requires
var express = require('express');
var bodyParse = require('body-parser');


// Ejecutar express
var app = express();

// Cargar archivos de rutas
var user_routes = require('./routes/user');

// Middlewares
app.use(bodyParse.urlencoded({
    extended: false
}));
app.use(bodyParse.json());

// CORS

// Reescribir rutas
app.use('/api', user_routes);


// Exportar modulo
module.exports = app;