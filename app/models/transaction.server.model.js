'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
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
  value: { type: Number, required: true }, // cents
  kind: { type: String, enum: kinds },
  status: { type: String, enum: statusList, default: 'created' }
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

mongoose.model('Transaction', TransactionSchema);
