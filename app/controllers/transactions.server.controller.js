'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
  moment = require('moment'),
  async = require('async'),
	Transaction = mongoose.model('Transaction'),
  User = mongoose.model('User'),
	_ = require('lodash');

/**
 * Create a Transaction
 */
exports.create = function(req, res) {
	var transaction = new Transaction(req.body);
	transaction.user = req.user;

  if (req.body.date && req.body.date !== '') {
    transaction.date = moment(req.body.date);
  }

  if (req.body.dueDate && req.body.dueDate !== '') {
    transaction.dueDate = moment(req.body.dueDate);
  }

  User.findByEmail(transaction.to, function(err, friend) {
    transaction.friend = friend;
    transaction.save(function(err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(transaction);
      }
    });
  });
};

/**
 * Show the current Transaction
 */
exports.read = function(req, res) {
	res.jsonp(req.transaction);
};

/**
 * Update a Transaction
 */
exports.update = function(req, res) {
	var transaction = req.transaction;

	transaction = _.extend(transaction , req.body);
  if (req.body.date && req.body.date !== '') {
    transaction.date = moment(req.body.date);
  }

  if (req.body.dueDate && req.body.dueDate !== '') {
    transaction.dueDate = moment(req.body.dueDate);
  }

  User.findByEmail(transaction.to, function(err, friend) {
    transaction.friend = friend;
    transaction.save(function(err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(transaction);
      }
    });
  });
};

/**
 * Delete an Transaction
 */
exports.delete = function(req, res) {
	var transaction = req.transaction ;

	transaction.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(transaction);
		}
	});
};

/**
 * List of Transactions
 */
exports.list = function(req, res) {
  Transaction.findMy(req.user, function(err, transactions) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(transactions);
		}
	});

//  Transaction.aggregate().group({
//    _id: { user: '$user', kind: '$kind', to: '$to'},
//    total: { $sum: '$value' },
//    average: { $avg: '$value' },
//    count: { $sum: 1 }
//  }).exec(function(err, result) {
//    var json = [];
//    async.each(result, function(one, done) {
//      User.findById(one._id.user, 'id displayName email', function(err, user) {
//        one._id.user = user;
//        json.push(one);
//        done();
//      });
//    }, function(err) {
//      console.log(json);
//    });
//
//  });
//  res.jsonp([]);
};

/**
 * Transaction middleware
 */
exports.transactionByID = function(req, res, next, id) { 
	Transaction.findById(id).populate('user', 'displayName').exec(function(err, transaction) {
		if (err) return next(err);
		if (! transaction) return next(new Error('Failed to load Transaction ' + id));
		req.transaction = transaction;
		next();
	});
};

/**
 * Transaction authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.transaction.user.id !== req.user.id && req.transaction.to !== req.user.email) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

exports.canPay = function(req, res, next) {
  var transaction = req.transaction,
    user = req.user,
    canPay = (transaction.user.id === user.id || transaction.to === user.email) &&
      (transaction.status === 'created' || transaction.status === 'accepted');

  if (req.body.status === 'paid' && !canPay) {
    return res.status(400).send('Can\'t pay a revoked transaction');
  }
  next();
};
