'use strict';

module.exports = function (app) {
  var users = require('../../app/controllers/users.server.controller');
  var payables = require('../../app/controllers/payables.server.controller');

  app.route('/payables')
    .get(users.requiresLogin, payables.list);
};
