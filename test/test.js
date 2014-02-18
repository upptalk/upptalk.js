(function(global) {

  'use strict';

  /* global suite, test */

  var assert;
  var config;
  var UppTalk;

  if (typeof module !== 'undefined' && module.exports) {
    UppTalk = require('..');
    assert = require('assert');
    config = require('./config');
  }
  else {
    UppTalk = global.UppTalk;
    assert = function assert(expr, msg) {
      if (!expr) throw new Error(msg || 'failed');
    };
    config = global.config;
  }

  suite('Client', function() {
    test('no config', function() {
      var client = new UppTalk();
      assert(client.secure === true);
      assert(client.port === 443);
      assert(client.host === 'happy.dev.ym.ms');
    });

    test('custom config, default values', function() {
      var client = new UppTalk({host: 'example.com', apikey: 'foo'});
      assert(client.secure === true);
      assert(client.port === 443);
      assert(client.host === 'example.com');
      assert(client.apikey === 'foo');
    });

    test('custom config, default values', function() {
      var client = new UppTalk({host: 'example.com'});
      assert(client.secure === true);
      assert(client.port === 443);
      assert(client.host === 'example.com');
    });
  });

  suite('Client API', function() {
    var client = new UppTalk(config);
    client.username = config.username;
    client.password = config.password;

    test('open', function(done) {
      client.open();
      client.once('open', done);
    });
    test('http ping', function(done) {
      client.HTTPRequest({method: 'POST', body: {method: 'ping', id: Math.random().toString()}}, function(err) {
        assert(!err);
        done();
      });
    });
    test('websocket ping', function(done) {
      client.send('ping', function(err, res) {
        assert(err === undefined);
        assert(res === undefined);
        done();
      });
    });
    test('close', function(done) {
      client.once('close', function() {
        done();
      });
      client.close();
    });
  });
})(this);