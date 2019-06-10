'use strict'

var validator = require('validator');
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');


var controller = {
    save: function (req, res) {
        // Recoger los parametros de la petición
        var params = req.body;

        // Validar los datos
        try {
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch (err) {
            return res.status(200).send({
                message: 'Faltan datos por enviar.'
            });
        }

        if (validate_name && validate_surname && validate_email && validate_password) {
            // Crear objeto de usuario
            var user = new User();

            // Asignar valores al objeto
            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email.toLowerCase();
            user.password;
            user.role = 'ROLE_USER';
            user.image = null;

            // Comprobar si el usuario existe
            User.findOne({
                    email: user.email,
                },
                (err, issetUser) => {
                    if (err) {
                        return res.status(500).send({
                            message: 'Error al comprobar duplicidad de usuario.',
                        });
                    }
                    if (!issetUser) {
                        // Si no existe, cifrar la contraseña y guardarlo
                        bcrypt.hash(params.password, null, null, (err, hash) => {
                            user.password = hash;

                            user.save((err, userStored) => {
                                if (err) {
                                    return res.status(500).send({
                                        message: 'Error al guardar el usuario.',
                                    });
                                }
                                if (!userStored) {
                                    return res.status(400).send({
                                        message: 'El usuario no se ha guardado.',
                                    });
                                }
                                // Devolver respuesta
                                return res.status(200).send({
                                    status: 'succes',
                                    message: 'El usuario se ha guardado correctamente.',
                                    user: userStored
                                });
                            }); // close save
                        }); // close bcrypt
                    } else {
                        return res.status(200).send({
                            message: 'El usuario ya está registrado.',
                        });
                    }
                });
        } else {
            return res.status(200).send({
                message: 'Validación de los datos incorrecta, intentelo de nuevo.',
            })
        }
    },
    login: function (req, res) {
        // Recoger los parametros de la petición
        var params = req.body;

        // Validar los datos
        try {
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.email);
        } catch (err) {
            return res.status(200).send({
                message: 'Faltan datos por enviar.'
            });
        }

        if (!validate_email || !validate_password) {
            return res.status(200).send({
                message: 'Los datos son incorrectos, envialos bien.'
            });
        }

        // Buscar usuarios que coincidan con el email
        User.findOne({
            email: params.email.toLowerCase()
        }, (err, user) => {
            if (err) {
                return res.status(500).send({
                    message: 'Error al intentar identificarse.'
                });
            }
            if (!user) {
                return res.status(404).send({
                    message: 'El usuario no existe.',
                });
            }

            // Si lo encuentra comprobar la contraseña
            bcrypt.compare(params.password, user.password, (err, check) => {

                if (check) {

                    // Generar token de jwt y devolverlo
                    if (params.gettoken) {
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    } else {
                        // Limpiar el objeto
                        user.password = undefined;

                        // Si es correcto devolver los datos
                        return res.status(200).send({
                            status: 'succes.',
                            message: 'Logeado con existo.',
                            user
                        });
                    }
                } else {
                    return res.status(200).send({
                        message: 'La contraseña no es correcta.',
                    });
                }
            });
        });
    },
    update: function (req, res) {
        // Recoger los datos del usuario
        var params = req.body

        // Validar datos
        try {

            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        } catch (err) {
            return res.status(200).send({
                message: 'Faltan datos por enviar.'
            });
        }

        // Eliminar propiedades innecesarias
        delete params.password;

        var userId = req.user.sub

        // Comprobar si el email es unico
        if (req.user.email != params.email) {
            User.findOne({
                email: params.email.toLowerCase()
            }, (err, user) => {
                if (err) {
                    return res.status(500).send({
                        message: 'Error al intentar identificarse.'
                    });
                }
                if (user && user.email == params.email) {
                    return res.status(200).send({
                        message: 'El email no puede ser modificado.',
                    });
                }
            });
        } else {
            // Buscar y actualizar documentos
            User.findOneAndUpdate({
                _id: userId
            }, params, {
                new: true
            }, (err, userUpdate) => {
                // Devolver una respuesta
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar el usuario.',
                        user: userUpdate
                    });
                }
                if (!userUpdate) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'No se ha actualizado el usuario.',
                        user: userUpdate
                    });
                }
                return res.status(200).send({
                    status: 'success',
                    message: 'Se ha actualizado los datos.',
                    user: userUpdate
                });
            });
        }
    }
};

module.exports = controller;