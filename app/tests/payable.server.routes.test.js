'use strict';

var should = require('should'),
  request = require('supertest'),
  app = require('../../server'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Transaction = mongoose.model('Transaction'),
  agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, friend, transaction;

describe('Payables tests', function() {
  beforeEach(function(done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'password'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local',
      transactions: [{
        value: -100,
        status: 'created',
        to: 'friend@test.com'
      }]
    });

    // friend
    friend = new User({
      firstName: 'Friend',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'friend@test.com',
      username: 'friend',
      password: 'password',
      provider: 'local',
      transactions: [{
        value: -100,
        status: 'created',
        to: 'person@test.com'
      }]
    });

    // Save a user to the test db and create new Transaction
    user.save(done);
  });

  it('should not be able to list payables if not logged in', function(done) {
    agent.get('/payables')
      .expect(401)
      .end(done);
  });

  it('should be able to list payables if logged in', function(done) {
    agent.post('/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function(signinErr, signinRes) {
        // Handle signin error
        if (signinErr) done(signinErr);

        agent.get('/payables')
          .end(function(req, res) {
            res.body.should.be.an.Array.with.lengthOf(1);
            done();
          });
      });
  });

  it('should not be able to list payables of other person', function(done) {
    friend.save(function() {
      agent.post('/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function(signinErr, signinRes) {
          // Handle signin error
          if (signinErr) done(signinErr);

          agent.get('/payables')
            .end(function(req, res) {
              res.body.should.be.an.Array.with.lengthOf(1);
              done();
            });
        });
    });
  });

  afterEach(function(done) {
    User.remove().exec();
    Transaction.remove().exec();
    done();
  });
});


