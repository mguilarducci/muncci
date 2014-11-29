'use strict';

var mongoose = require('mongoose'),
  Transaction = mongoose.model('Transaction'),
  User = mongoose.model('User');


Transaction.find({}).populate('user').exec(function(err, transactions) {
  //console.log(err);
  if (!err) {
    transactions.forEach(function(t) {
      console.log('-----------------------------------------');
      console.log('user: %s', t.user.displayName);
      console.log('to: %s', t.to);
      console.log('transaction: %s (%s) (%s)', t.id, t.value, t.kind);
      Transaction.userAppend(t.user, t);
    });
  }
});
