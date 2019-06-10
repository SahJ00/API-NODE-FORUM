'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'F0rUm-N0d3-Js-963217';

exports.authenticated = function (req, res, next) {
    // comprobar si llega autorización
    if (!req.headers.authorization) {
        return res.status(403).send({
            message: 'La petición no tiene la cabecera de authorization.'
        });
    }

    // Limpiar el token y quitar comillas
    var token = req.headers.authorization.replace(/['"]+/g, '');

    // Decodificar el token
    try {
        var payload = jwt.decode(token, secret);

        // Comprobar si el token ha expirado
        if (payload.exp <= moment().unix()) {
            return res.status(404).send({
                message: 'El token ha expirado.'
            });
        }
    } catch (ex) {
        return res.status(404).send({
            message: 'El token no es válido.'
        });
    }

    // Adjuntar usuario identificado a la request
    req.user = payload;

    // Pasar a la acción
    next();
};