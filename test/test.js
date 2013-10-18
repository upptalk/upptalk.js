'use strict';

var assert;

if (typeof module !== 'undefined' && typeof Y === 'undefined') {
  var Y = require('../lib/index');
  assert = require('assert');
}
else {
  assert = function assert(expr, msg) {
    if (!expr) throw new Error(msg || 'failed');
  }
}

var config = {
  username: '',
  password: '',
  port: 3232,
}

suite('Client API', function() {
  var client = new Y();

  test('open', function(done) {
    client.open('ws://localhost:' + config.port);
    client.on('open', done);
  });
  test('ping', function(done) {
    client.emit('ping', function(err, res) {
      assert(!err);
      assert(!res);
      done();
    });
  });
  test('authenticate', function(done) {
    client.request('authenticate', {username: config.username, password: config.password}, function(err, res) {
      assert(!err);
      assert(!res);
      done();
    });
  });
  // test('presence', function(done) {
  //   client.notify('presence');
  //   done();
  // });
  test('energy', function(done) {
    client.request('energy', function(err, energy) {
      assert(!err);
      assert(energy);
      done();
    })
  });
});
