'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');

exports.createToken = function (user) {
    var payload = {
        sub: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        image: user.image,
        github: user.github,
        linkedin: user.linkedin,
        twitter: user.twitter,
        facebook: user.facebook,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix()
    };
    return jwt.encode(payload, 'F0rUm-N0d3-Js-963217');
};