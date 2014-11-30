'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  errorHandler = require('./errors.server.controller'),
  _ = require('lodash'),
  User = mongoose.model('User');

exports.list = function(req, res) {
  User.aggregate()
    .unwind('transactions')
    .match({ email: req.user.email })
    .group({
      _id:  { from: '$email', to: '$transactions.to' },
      total: { $sum: '$transactions.value' },
      average: { $avg: '$transactions.value' },
      count: { $sum: 1 }
    }).exec(function(err, result) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(result);
      }
    });
};
