'use strict'

var controller = {
    probando: function (req, res) {
        return res.status(200).send({
            message: ' Soy el método probando.'
        })
    },
    testeando: function (req, res) {
        return res.status(200).send({
            message: ' Soy el método testeando.'
        })
    }
};

module.exports = controller;