'use strict'

var validator = require('validator');
var Topic = require('../models/topic');

var controller = {
    add: function (req, res) {
        // Recoger el id del topic de la url
        var topicId = req.params.topicId

        // Find por id del topic
        Topic.findById(topicId).exec((err, topic) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: "Error en la petición."
                })
            }
            if (!topic) {
                return res.status(404).send({
                    status: 'error',
                    message: "No existe el tema."
                })
            }
            // Comprobar objeto usuarip y validar datos
            if (req.body.content) {
                // Validar datos
                try {
                    var validate_content = !validator.isEmpty(req.body.content);
                } catch (err) {
                    return res.status(200).send({
                        status: 'success',
                        message: 'No has comentado nada.'
                    });
                }
                if (validate_content) {
                    var comment = {
                        user: req.user.sub,
                        content: req.body.content,
                    }

                    // En la propieda comments del objeto hacer un push
                    topic.comments.push(comment);

                    // Guardar el topic completo
                    topic.save((err) => {
                        if (err) {
                            return res.status(500).send({
                                status: 'error',
                                message: "Error al guardar el comentario."
                            })
                        }



                        Topic.findById(topic._id).populate('user').populate('comments.user').exec((err, topic) => {
                            if (err) {
                                return res.status(500).send({
                                    status: 'error',
                                    message: 'Error en la petición.'
                                });
                            }
                            if (!topic) {
                                return res.status(404).send({
                                    status: 'error',
                                    message: 'No existe el tema.'
                                });
                            }
                            // Devolver respuesta
                            return res.status(200).send({
                                status: 'success',
                                message: 'Listando los topic.',
                                topic
                            });
                        });

                    });
                } else {
                    return res.status(200).send({
                        status: 'success',
                        message: 'No se han validado los datos del comentario.'
                    });
                }
            }
        });
    },
    update: function (req, res) {
        // Conseguir id del comentario que llega de la url
        var commentId = req.params.commentId;

        // Recoger datos y validar
        var params = req.body

        // Validar datos
        try {
            var validate_content = !validator.isEmpty(req.body.content);
        } catch (err) {
            return res.status(200).send({
                status: 'success',
                message: 'No has comentado nada.'
            });
        }

        if (validate_content) {
            // Find and update de subdocumento
            Topic.findOneAndUpdate({
                    "comments._id": commentId,
                }, {
                    "$set": {
                        "comments.$.content": params.content
                    }
                }, {
                    new: true
                },
                (err, topicUpdate) => {
                    if (err) {
                        return res.status(500).send({
                            status: 'error',
                            message: "Error en la petición."
                        })
                    }
                    if (!topicUpdate) {
                        return res.status(404).send({
                            status: 'error',
                            message: "No existe el tema."
                        })
                    }
                    // Devolver los datos
                    return res.status(200).send({
                        status: 'success',
                        message: "El comentario se ha actualizado.",
                        topic: topicUpdate
                    });
                });
        }
    },
    delete: function (req, res) {
        // Sacar el id del topic y del comentario a borrar
        var topicId = req.params.topicId;
        var commentId = req.params.commentId;

        // Buscar el topic
        Topic.findById(topicId, (err, topic) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: "Error en la petición."
                })
            }
            if (!topic) {
                return res.status(404).send({
                    status: 'error',
                    message: "No existe el tema."
                })
            }
            // Seleccionar el subdocumento (comentario)
            var comment = topic.comments.id(commentId);

            // Borar el comentario
            if (comment) {
                comment.remove();

                // Guardar el topic
                topic.save((err) => {
                    if (err) {
                        return res.status(404).send({
                            status: 'error',
                            message: "No existe el comentario."
                        });
                    }
                    Topic.findById(topic._id).populate('user').populate('comments.user').exec((err, topic) => {
                        if (err) {
                            return res.status(500).send({
                                status: 'error',
                                message: 'Error en la petición.'
                            });
                        }
                        if (!topic) {
                            return res.status(404).send({
                                status: 'error',
                                message: 'No existe el tema.'
                            });
                        }
                        // Devolver respuesta
                        return res.status(200).send({
                            status: 'success',
                            message: 'Listando los topic.',
                            topic
                        });
                    });
                });
            } else {
                return res.status(404).send({
                    status: 'error',
                    message: "No existe el comentario."
                })
            }
        });
    }
};
module.exports = controller;