'use strict'

var validator = require('validator');
var Topic = require('../models/topic');

var controller = {
    save: function (req, res) {
        // Recoger parametros por post
        var params = req.body;

        // Validar datos
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);
        } catch (err) {
            return res.status(200).send({
                message: 'Faltan datos por enviar'
            });
        }

        if (validate_content && validate_title && validate_lang) {
            // Crear objeto a guardar
            var topic = new Topic();

            // Asignar valores 
            topic.title = params.title;
            topic.content = params.content;
            topic.code = params.code;
            topic.lang = params.lang.toLowerCase();
            topic.user = req.user.sub;

            // Guardar el topic
            topic.save((err, topicStored) => {
                if (err || !topicStored) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'El tema no se ha guardado.'
                    });
                }
                // Devolver respuesta
                return res.status(200).send({
                    status: 'success',
                    message: 'Se ha guardado correctamente.',
                    topic: topicStored
                });
            });
        } else {
            return res.status(200).send({
                message: 'Los datos no son validos.',
            });
        }
    },
    getTopics: function (req, res) {
        // Cargar la libreria de paginación en la clase en models/topic

        // Recoger la página actual
        if (req.params.page == null || req.params.page == 0 || req.params.page == "0" || req.params.page == undefined || req.params.page == false) {
            var page = 1;
        } else {
            var page = parseInt(req.params.page);
        }

        // Indicar las opciones de paginación
        var options = {
            sort: {
                date: -1
            },
            populate: 'user',
            limit: 5,
            page: page
        }

        // Find paginado
        Topic.paginate({}, options, (err, topics) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al hacer la consulta.'
                });
            }
            if (!topics) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay topics.'
                });
            }
            // Devolver resultado (topics, total de topic, total de paginas)
            return res.status(200).send({
                status: 'success',
                message: 'Listando de Topics correcto.',
                topics: topics.docs,
                totalDocs: topics.totalDocs,
                totalPages: topics.totalPages
            });
        });
    },
    getTopicsByUser: function (req, res) {
        // Conseguir el id del usuario
        var userId = req.params.user;

        // Find con una condicion de usuario
        Topic.find({
            user: userId
        }).sort([
            ['date', 'descending']
        ]).exec((err, topics) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición.'
                });
            }
            if (!topics) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay temas para mostrar.'
                });
            }
            // Devolver respuesta
            return res.status(200).send({
                status: 'success',
                message: 'Listando de Topics correcto.',
                topics
            });
        });
    },
    getTopic: function (req, res) {
        // Sacar el id del topic de la url
        var topicId = req.params.id

        // Find por id del topic
        Topic.findById(topicId).populate('user').exec((err, topic) => {
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

    },
    update: function (req, res) {
        // Recoger el id del topic de la url
        var topicId = req.params.id;

        // Recoger los datos que llegan desde post
        var params = req.body;

        // Validar datos
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);
        } catch (err) {
            return res.status(200).send({
                message: 'Faltan datos por enviar'
            });
        }

        if (validate_title && validate_content && validate_lang) {
            // Montar un json con los datos a modificar
            var update = {
                title: params.title,
                content: params.content,
                code: params.code,
                lang: params.lang
            }

            // Find and update del topic por id y por id de usuario
            Topic.findOneAndUpdate({
                _id: topicId,
                user: req.user.sub
            }, update, {
                new: true
            }, (err, topicUpdate) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en la petición.'
                    });
                }

                if (!topicUpdate) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'El topic no se ha actualizado.'
                    });
                }
                //Devolver una respuesta
                return res.status(200).send({
                    status: 'success',
                    message: 'Topic actualizado correctamente.',
                    topicUpdate
                });
            });
        } else {
            return res.status(200).send({
                status: 'success',
                message: 'La validación de los datos no es correcta.'
            });
        }
    },
    delete: function (req, res) {
        // Sacar el id del tipic de la url
        var topicId = req.params.id;

        // Find and delete por topicID y por userID
        Topic.findOneAndDelete({
            _id: topicId,
            user: req.user.sub
        }, (err, topicRemove) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición.'
                });
            }

            if (!topicRemove) {
                return res.status(404).send({
                    status: 'error',
                    message: 'El topic no se ha eliminado.'
                });
            }
            // Devolver una respuesta
            return res.status(200).send({
                status: 'success',
                message: "Topic eliminado correctamente.",
                topicRemove
            })
        })


    },
    search: function (req, res) {
        // Sacar string a buscar de la url
        var searchString = req.params.search;
        // Find operador OR
        Topic.find({
            "$or": [{
                    "title": {
                        "$regex": searchString,
                        "$options": "i"
                    }
                },
                {
                    "content": {
                        "$regex": searchString,
                        "$options": "i"
                    }
                },
                {
                    "lang": {
                        "$regex": searchString,
                        "$options": "i"
                    }
                },
                {
                    "code": {
                        "$regex": searchString,
                        "$options": "i"
                    }
                }
            ]
        }).sort([
            ['date', 'descending']
        ]).exec((err, topics) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición.',
                });
            }
            if (!topics) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay temas disponibles.'
                });
            }
            // Devolver respuesta
            return res.status(200).send({
                status: 'success',
                message: 'Topics encontrados.',
                topics
            });
        });
    }
};

module.exports = controller;