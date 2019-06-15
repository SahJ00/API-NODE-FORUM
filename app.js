'use strict'

// Requires
var express = require('express');
var bodyParse = require('body-parser');


// Ejecutar express
var app = express();

// Cargar archivos de rutas
var user_routes = require('./routes/user');
var topic_routes = require('./routes/topic');
var comment_routes = require('./routes/comment');

// Middlewares
app.use(bodyParse.urlencoded({
    extended: false
}));
app.use(bodyParse.json());

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


// Reescribir rutas
app.use('/api', user_routes);
app.use('/api', topic_routes);
app.use('/api', comment_routes);


// Exportar modulo
module.exports = app;