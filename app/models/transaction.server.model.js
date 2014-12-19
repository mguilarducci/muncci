'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  moment = require('moment'),
  async = require('async'),
  _ = require('lodash'),
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
  friend: {
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

TransactionSchema.statics.findMy = function(user, where, cb) {
  var and = where,
    or = [
    { user: user },
    { 'to': user.email }
  ];

  if (_.isFunction(where)) {
    cb = where;
    and = {};
  }

  if (user.providerData) {
    or.push({ 'to': user.providerData.email });
  }

  if (user.additionalProvidersData && user.additionalProvidersData.google) {
    or.push({ 'to': user.additionalProvidersData.google.email });
  }

  if (user.additionalProvidersData && user.additionalProvidersData.facebook) {
    or.push({ 'to': user.additionalProvidersData.facebook.email });
  }

  this.find({ $or: or })
    .and(and)
    .sort('-created')
    .populate('user', 'displayName')
    .populate('friend', 'id displayName')
    .exec(cb);
};

mongoose.model('Transaction', TransactionSchema);
