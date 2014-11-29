'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
  moment = require('moment'),
	User = mongoose.model('User'),
	Transaction = mongoose.model('Transaction');

/**
 * Globals
 */
var user, friend, transaction;

/**
 * Unit tests
 */
describe('Transaction Model Unit Tests:', function() {
	beforeEach(function(done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password',
      provider: 'local'
		});

    friend = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'friend@test.com',
      username: 'friendx',
      password: 'password',
      provider: 'local',
      providerData: { email: 'providerData@test.com' },
      additionalProvidersData: {
        google: { email: 'google@test.com' },
        facebook: { email: 'facebook@test.com' }
      }
    });

    user.save(function() {
			transaction = new Transaction({
				name: 'Transaction Name',
				user: user,
        to: 'friend@test.com',
        value: 100,
        kind: 'pay',
        date: moment('1988-05-09'),
        dueDate: moment('1988-05-09')
			});

      friend.save(done);
			// done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return transaction.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without name', function(done) {
			transaction.name = '';

			return transaction.save(function(err) {
				should.exist(err);
				done();
			});
		});

    it('should be able to show an error when try to save without value', function(done) {
      transaction.value = null;

      return transaction.save(function(err) {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without kind', function(done) {
      transaction.kind = '';

      return transaction.save(function(err) {
        should.exist(err);
        done();
      });
    });
	});

  describe('Method userAppend', function() {
    it('should append the transaction in user.transaction as negative (kind pay)', function(done) {
      transaction.kind = 'pay';
      Transaction.userAppend(user, transaction, function() {
        User.findById(user._id, function(err, user) {
          user.transactions[0].myValue.should.equal(-100);
          done();
        });
      });
    });

    it('should append the transaction in user.transactions as positive (kind receive)', function(done) {
      transaction.kind = 'receive';
      Transaction.userAppend(user, transaction, function() {
        User.findById(user._id, function(err, user) {
          user.transactions[0].myValue.should.equal(100);
          done();
        });
      });
    });

    it('should append the transaction in friend.transactions as positive (kind pay)', function(done) {
      transaction.kind = 'pay';
      Transaction.userAppend(user, transaction, function() {
        User.findById(friend._id, function(err, friend) {
          friend.transactions[0].myValue.should.equal(100);
          done();
        });
      });
    });

    it('should append the transaction in friend.transactions as negative (kind receive)', function(done) {
      transaction.kind = 'receive';
      Transaction.userAppend(user, transaction, function() {
        User.findById(friend._id, function(err, friend) {
          friend.transactions[0].myValue.should.equal(-100);
          done();
        });
      });
    });

    it('should append with providerData email', function(done) {
      transaction.kind = 'pay';
      transaction.to = 'providerData@test.com';
      Transaction.userAppend(user, transaction, function() {
        User.findById(friend._id, function(err, friend) {
          friend.transactions.length.should.equal(1);
          done();
        });
      });
    });

    it('should append with google email', function(done) {
      transaction.kind = 'pay';
      transaction.to = 'google@test.com';
      Transaction.userAppend(user, transaction, function() {
        User.findById(friend._id, function(err, friend) {
          friend.transactions.length.should.equal(1);
          done();
        });
      });
    });

    it('should append with facebook email', function(done) {
      transaction.kind = 'pay';
      transaction.to = 'facebook@test.com';
      Transaction.userAppend(user, transaction, function() {
        User.findById(friend._id, function(err, friend) {
          friend.transactions.length.should.equal(1);
          done();
        });
      });
    });

    it('should append only different transactions', function(done) {
      transaction.kind = 'pay';
      Transaction.userAppend(user, transaction, function() {
        Transaction.userAppend(user, transaction, function() {
          User.findById(user._id, function(err, user) {
            user.transactions.length.should.equal(1);
            done();
          });
        });
      });
    });
  });

	afterEach(function(done) { 
		Transaction.remove().exec();
		User.remove().exec();

		done();
	});
});
