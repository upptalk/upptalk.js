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
var profile = {
  fullname: 'John Doe2',
  nickname: 'John',
  email: 'john@doe.com',
  birthday: '1234-12-30',
  avatar: 'http://www.johndoe.pro/img/John_Doe.jpg',
  city: 'Denver',
  region: 'US-AL',
  country: 'US'
};


var groups;

suite('Client', function() {
  test('default config', function() {
    var client = new Y();
    assert(client.secure === true);
    assert(client.port === 443);
    assert(client.hostname === 'happy.ym.ms');
    assert(client.urls.websocket === 'wss://happy.ym.ms:443');
    assert(client.urls.http === 'https://happy.ym.ms:443');
  });

  test('custom config, default values', function() {
    var client = new Y({hostname: 'example.com'});
    assert(client.secure === true);
    assert(client.port === 443);
    assert(client.hostname === 'example.com');
    assert(client.urls.websocket === 'wss://example.com:443');
    assert(client.urls.http === 'https://example.com:443');
  });

  test('custom config, default values', function() {
    var client = new Y({hostname: 'example.com'});
    assert(client.secure === true);
    assert(client.port === 443);
    assert(client.hostname === 'example.com');
    assert(client.urls.websocket === 'wss://example.com:443');
    assert(client.urls.http === 'https://example.com:443');
  });

  test('custom config, string', function() {
    var client = new Y('example.com');
    assert(client.secure === true);
    assert(client.port === 443);
    assert(client.hostname === 'example.com');
    assert(client.urls.websocket === 'wss://example.com:443');
    assert(client.urls.http === 'https://example.com:443');
  });
});

suite('Client API', function() {
  var client = new Y(config);
  client.username = config.username;
  client.password = config.password;

  test('open', function(done) {
    client.open();
    client.on('open', done);
  });
  test('ping', function(done) {
    client.emit('ping', function(err, res) {
      assert(err === undefined);
      assert(res === undefined);
      done();
    });
  });
  test('register:available false', function(done) {
    client.emit('register:available', config.username, function(err, res) {
      assert(!err);
      assert(res === false);
      done();
    });
  });
  test('register:available true', function(done) {
    client.emit('register:available', Math.random().toString(), function(err, res) {
      assert(!err);
      assert(res === true);
      done();
    });
  });
  // test('register', function(done) {
  //   var register = {

  //   };
  //   client.emit('register', register, function() {
  //     console.log(arguments);
  //   });
  // });
  test('captcha', function(done) {
    client.emit('captcha', function(err, res) {
      assert(!err);
      assert(typeof res === 'object');
      assert(typeof res.token === 'string');
      assert(typeof res.question === 'string');
      assert(Array.isArray(res.choices));
      assert(res.choices.length === 3);
      done();
    });
  });
  test('authenticate', function(done) {
    client.emit('authenticate', {username: config.username, password: config.password}, function(err) {
      assert(err === undefined);
      done();
    });
  });
  //FIXME fix needed for w3c-xmlhttprequest
  // test('upload', function(done) {
  //   client.emit('upload', 'hello', function(err, res) {
  //     assert(!err);
  //     console.log(res)
  //     done();
  //   });
  // });
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
  test('sync', function(done) {
    var sync = {
      phone: ['+33651090039'],
      username: ['sonnypiers10'],
      // gplus: 'test'
      // twitter: Math.random().toString()
    };
    client.emit('sync', sync, function(err, synced) {
      assert(!err);
      for (var i in sync)
        assert(synced[i])
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
    });
    client.emit('chat', {number: '+33651090039', message: {id: 'test43', value: 'hello'}});
  });
  test('set profile', function(done) {
    client.emit('profile', profile, function(err, res) {
      assert(err === undefined);
      assert(res === undefined);
      done();
    });
  });
  test('get own profile', function(done) {
    client.emit('profile', function(err, res) {
      assert(!err);
      for (var i in profile)
        assert(profile[i] === res[i]);
      done();
    });
  });
  test('get profile of contact', function(done) {
    client.emit('profile', 'sonnypiers8', function(err, res) {
      assert(!err);
      for (var i in profile)
        assert(profile[i] === res[i]);
      done();
    });
  });
  test('change password', function(done) {
    client.emit('password', config.password, function(err, res) {
      assert(err === undefined);
      assert(res === undefined);
      done();
    });
  });
  // test('chatstate')
  // test('presence')
  // test('receipt')
});
