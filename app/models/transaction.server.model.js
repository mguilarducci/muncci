'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  moment = require('moment'),
  async = require('async'),
	Schema = mongoose.Schema;

var statusList = 'created revoked accepted paid'.split(' '),
  kinds = 'pay receive'.split(' ');

/**
 * Transaction Schema
 */
var TransactionSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Transaction name',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
  updated: {
    type: Date,
    default: Date.now
  },
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
  to: {
    type: String,
    trim: true,
    default: '',
    match: [/.+\@.+\..+/, 'Please fill a valid email address']
  },
  value: { type: Number, required: true },
  kind: { type: String, enum: kinds },
  status: { type: String, enum: statusList, default: 'created' },
  date: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date
  }
});

TransactionSchema.pre('save', function(next) {
  this.updated = moment();
  next();
});

TransactionSchema.statics.findMy = function(user, cb) {
  var or = [
    { user: user },
    { 'to': user.email }
  ];

  if (user.providerData) {
    or.push({ 'to': user.providerData.email });
  }

  if (user.additionalProvidersData && user.additionalProvidersData.google) {
    or.push({ 'to': user.additionalProvidersData.google.email });
  }

  if (user.additionalProvidersData && user.additionalProvidersData.facebook) {
    or.push({ 'to': user.additionalProvidersData.facebook.email });
  }

  this.find({ $or: or }).sort('-created').populate('user', 'displayName').exec(cb);
};

TransactionSchema.statics.userAppend = function(currentUser, transaction, cb) {
  var User = mongoose.model('User');

  var or = [
    { 'email': transaction.to },
    { 'providerData.email': transaction.to },
    { 'additionalProvidersData.google.email': transaction.to },
    { 'additionalProvidersData.facebook.email': transaction.to }
  ];

  var positive = { transaction: transaction, myValue: transaction.value },
    negative = { transaction: transaction, myValue: transaction.value * -1 };

  User.findOne({ $or: or }, function(err, friend) {
    if (transaction.kind === 'pay') {
        currentUser.transactions.push(negative);
      if (friend) {
        friend.transactions.push(positive);
      }
    } else {
      currentUser.transactions.push(positive);
      if (friend) {
        friend.transactions.push(negative);
      }
    }

    async.parallel([
      function(done) {
        currentUser.save(done);
      },
      function(done) {
        if (friend) {
          friend.save(done);
        } else {
          done();
        }
      }
    ], cb);
  });
};

mongoose.model('Transaction', TransactionSchema);
