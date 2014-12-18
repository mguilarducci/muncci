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

	afterEach(function(done) { 
		Transaction.remove().exec();
		User.remove().exec();

		done();
	});
});
