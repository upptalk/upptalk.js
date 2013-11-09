'use strict';

/* global suite, test */

var assert;
var config;

if (typeof module !== 'undefined' && typeof Y === 'undefined') {
  var Y = require('../lib/index');
  assert = require('assert');
  config = require('./config');
}
else {
  assert = function assert(expr, msg) {
    if (!expr) throw new Error(msg || 'failed');
  };
}

var isArray = function(obj) {
  return Array.isArray(obj);
};
var isObject = function(obj) {
  return (!Array.isArray(obj) && obj !== null && obj !== undefined);
};

var groups;

suite('Client API', function() {
  var client = new Y();

  test('open', function(done) {
    client.open(config.url);
    client.on('open', done);
  });
  test('ping', function(done) {
    client.emit('ping', function(err, res) {
      assert(err === undefined);
      assert(res === undefined);
      done();
    });
  });
  test('authenticate', function(done) {
    client.emit('authenticate', {username: config.username, password: config.password}, function(err, res) {
      assert(err === undefined);
      assert(err === undefined);
      done();
    });
  });
  test('energy', function(done) {
    client.emit('energy', function(err, energy) {
      assert(err === undefined);
      assert(energy);
      done();
    });
  });
  test('remaining', function(done) {
    client.emit('remaining', function(err, remaining) {
      assert(err === undefined);
      assert(isObject(remaining));
      assert(remaining.voice);
      assert(remaining.sms);
      done();
    });
  });
  test('groupchats', function(done) {
    client.emit('groupchats', function(err, groupchats) {
      groups = groupchats;
      assert(!err);
      assert(isArray(groupchats));
      done();
    });
  });
  test('participants', function(done) {
    if (groups.length === 0)
      return done();
    client.emit('participants', groups[0].id, function(err, participants) {
      assert(!err);
      assert(isArray(participants));
      done();
    });
  });
  test('contacts', function(done) {
    client.emit('contacts', function(err, contacts) {
      assert(!err);
      assert(isObject(contacts));
      done();
    });
  });
  test('last-activity', function(done) {
    client.emit('last-activity', function(err, lastActivity) {
      assert(!err);
      assert(lastActivity);
      done();
    });
  });
  test('presence', function(done) {
    client.emit('presence');
    done();
  });
  test('chat message to itself', function(done) {
    var c = 0;
    client.on('chat', function(payload) {
      if (payload.id !== 'test42')
        return;

      assert(payload.message === 'hello');
      done();
    });
    client.emit('chat', {user: config.username, message: {id: 'test42', value: 'hello'}});
  });
  test('chat message to number', function(done) {
    var c = 0;
    client.on('receipt', function(payload) {
      if (payload.id !== 'test43')
        return;

      if (payload.type === 'error')
        return done();

      assert(payload.type === 'sent');

      if (++c === 2)
        done();
    });
    client.on('energy', function(payload) {
      assert(typeof payload === 'string');
      if (++c === 2)
        done();
    })
    client.emit('chat', {number: '+33651090039', message: {id: 'test43', value: 'hello'}});
  });
  // test('chatstate')
  // test('presence')
  // test('receipt')
});
