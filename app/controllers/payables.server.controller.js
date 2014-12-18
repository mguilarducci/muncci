'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  errorHandler = require('./errors.server.controller'),
  _ = require('lodash'),
  async = require('async'),
  Transaction = mongoose.model('Transaction'),
  User = mongoose.model('User');

exports.list = function(req, res) {
  Transaction.aggregate()
    .match({
      '$or': [
        { user: req.user._id },
        { friend: req.user._id }
      ],
      status: { $nin: ['paid', 'revoked'] }
    })
    .group({
      _id: {
        friend: {
          $cond: {
            if: { $eq: ['$friend', req.user._id] },
            then: '$user',
            else: {
              $ifNull: ['$friend', '$to']
            }
          }
        }
      },
      total: {
        $sum: {
          $cond: {
            if: {
              $or: [
                { $and: [
                  { $eq: ['$user', req.user._id] },
                  { $eq: ['$kind', 'receive'] }
                ]},
                { $and: [
                  { $eq: ['$friend', req.user._id] },
                  { $eq: ['$kind', 'pay'] }
                ]}
              ]
            },
            then: '$value',
            else: { $multiply: ['$value', -1] }
          }
        }
      },
      average: { $avg: '$value' },
      count: { $sum: 1 }
    })
    .exec(function(err, result) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        var payables = [];

        async.each(result, function(payable, done) {
          User.findById(payable._id.friend).select('id displayName').exec(function(err, friend) {
            if (friend) {
              payable._id.to = friend.displayName;
            } else {
              payable._id.to = payable._id.friend;
            }
            payables.push(payable);
            done();
          });
        }, function(err) {
          res.jsonp(payables);
        });

      }
    });
};
