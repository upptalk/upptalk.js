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
  var group;

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
    test('HTTPRequest', function(done) {
      client.HTTPRequest({method: 'POST', body: {method: 'ping', id: Math.random().toString()}}, function(err) {
        assert(!err);
        done();
      });
    });
    test('ping', function(done) {
      client.send('ping', function(err, res) {
        assert(err === undefined);
        assert(res === undefined);
        done();
      });
    });
    test('register:available false', function(done) {
      client.send('register:available', config.username, function(err, res) {
        assert(!err);
        assert(res === false);
        done();
      });
    });
    test('register:available true', function(done) {
      client.send('register:available', Math.random().toString(), function(err, res) {
        assert(!err);
        assert(res === true);
        done();
      });
    });
    // test('register', function(done) {
    //   var register = {

    //   };
    //   client.send('register', register, function() {
    //     console.log(arguments);
    //   });
    // });
    test('captcha', function(done) {
      client.send('captcha', function(err, res) {
        assert(!err);
        assert(typeof res === 'object');
        assert(typeof res.token === 'string');
        assert(typeof res.question === 'string');
        assert(typeof res.choices === 'object');
        assert(res.choices['1']);
        assert(res.choices['2']);
        assert(res.choices['3']);
        done();
      });
    });
    test('options enable XMPP forwarding', function(done) {
      client.send('options', {xmpp: true}, function(err, res) {
        assert(err === undefined);
        assert(res === undefined);
        done();
      });
    });
    test('authenticate', function(done) {
      client.send('authenticate', {username: config.username, password: config.password}, function(err) {
        assert(err === undefined);
        done();
      });
    });
    test('send xmpp stanza', function(done) {
      var stanza = '<iq id="foo" type="get"><ping xmlns="urn:xmpp:ping"/></iq>';
      client.on('xmpp:out', function(p) {
        if (p === stanza)
          done();
      });
      client.send('xmpp', stanza);
    });
    test('disable xmpp forwarding', function(done) {
      client.send('options', {xmpp: false}, function(err, res) {
        assert(err === undefined);
        assert(res === undefined);
        done();
      });
    });
    //FIXME fix needed for w3c-xmlhttprequest
    // test('upload', function(done) {
    //   client.send('upload', 'hello', function(err, res) {
    //     assert(!err);
    //     console.log(res)
    //     done();
    //   });
    // });
    test('get contacts', function(done) {
      client.send('contacts', function(err, contacts) {
        assert(!err);
        assert(typeof contacts === 'object');
        done();
      });
    });
    test('add contact', function(done) {
      client.send('contacts', [{op: 'add', path: '/foo', value: {name: 'foo', ids: [
        {type: 'username', value: config.username}
      ]}}], function(err) {
        assert(!err);
        done();
      });
    });
    test('get contacts, check exist', function(done) {
      client.send('contacts', function(err, contacts) {
        assert(!err);
        assert(typeof contacts === 'object');
        assert(typeof contacts['foo'] === 'object');
        done();
      });
    });
    test('delete contact', function(done) {
      client.send('contacts', [{op: 'remove', path: '/foo'}], function(err) {
        assert(!err);
        done();
      });
    });
    test('get contacts, check inexist', function(done) {
      client.send('contacts', function(err, contacts) {
        assert(!err);
        assert(typeof contacts === 'object');
        assert(typeof contacts['foo'] === 'undefined');
        done();
      });
    });
    test('presence', function(done) {
      client.send('presence');
      done();
    });
    test('credit', function(done) {
      client.send('credit', function(err, credit) {
        assert(err === undefined);
        assert(credit);
        done();
      });
    });
    test('remaining', function(done) {
      client.send('remaining', '+33651090039', function(err, remaining) {
        assert(err === undefined);
        assert(isObject(remaining));
        assert(typeof remaining.voice === 'number');
        assert(typeof remaining.sms === 'number');
        done();
      });
    });
    test('group', function(done) {
      client.send('group', function(err, res) {
        assert(typeof res === 'string');
        group = res;
        done();
      });
    });
    test('group:name', function(done) {
      client.send('group:name', {group: group, name: 'foo'}, function(err) {
        assert(!err);
        done();
      });
    });
    test('groups', function(done) {
      client.send('groups', function(err, res) {
        groups = res;
        assert(!err);
        assert(isArray(groups));
        var gc;
        for (var i = 0; i < groups.length; i++) {
          if (groups[i].id === group) {
            gc = groups[i];
          }
          else {
            client.send('group:leave', groups[i].id);
          }
        }
        assert(typeof gc === 'object');
        assert(gc.name === 'foo');
        done();
      });
    });
    test('group:members', function(done) {
      client.send('group:members', group, function(err, members) {
        assert(!err);
        assert(isArray(members));
        done();
      });
    });
    test('group:leave', function() {
      client.send('group:leave', group);
    });
    test('sync', function(done) {
      var sync = {
        phone: ['+33651090039'],
        username: ['sonnypiers10'],
        // gplus: 'test'
        // twitter: Math.random().toString()
      };
      client.send('sync', sync, function(err, synced) {
        assert(!err);
        for (var i in sync)
          assert(synced[i]);
        done();
      });
    });
    test('last-activity', function(done) {
      client.send('last-activity', config.username, function(err, lastActivity) {
        assert(!err);
        assert(lastActivity);
        done();
      });
    });
    test('chat message to itself', function(done) {
      //https://yuilop.atlassian.net/browse/CORE-1726
      // var c = 0;
      // client.once('receipt', function(payload) {
      //   if (payload.id !== 'test42')
      //     return;

      //   // if (++c === 2)
      //   done();
      // });
      //message from itself disabled
      client.once('chat', function(payload) {
        if (payload.id !== 'test42')
          return;

        assert(payload.text === 'hello');

        // if (++c === 2)
        done();
      });
      client.send('chat', {user: config.username, id: 'test42', text: 'hello'});
    });
    test('chat message to other', function(done) {
      client.once('receipt', function(payload) {
        if (payload.id !== 'test43')
          return;

        // if (++c === 2)
        done();
      });
      client.send('chat', {user: 'sonny', id: 'test43', text: 'hello'});
    });
    test('chat message to number', function(done) {
      var c = 0;
      client.once('receipt', function(payload) {
        if (payload.id !== 'test44')
          return;

        if (payload.type === 'error')
          return done();

        assert(payload.type === 'sent');

        if (++c === 2)
          done();
      });
      client.once('credit', function(payload) {
        assert(typeof payload === 'string');
        if (++c === 2)
          done();
      });
      client.send('chat', {number: '+33651090039', id: 'test44', text: 'hello'});
    });
    test('set profile', function(done) {
      client.send('profile', profile, function(err, res) {
        assert(err === undefined);
        assert(res === undefined);
        done();
      });
    });
    test('get own profile', function(done) {
      client.send('profile', function(err, res) {
        assert(!err);
        for (var i in profile)
          assert(profile[i] === res[i]);
        done();
      });
    });
    test('get profile of contact', function(done) {
      client.send('profile', 'sonnypiers8', function(err, res) {
        assert(!err);
        for (var i in res)
          assert(profile[i] === res[i]);
        done();
      });
    });
    test('change password', function(done) {
      client.send('password', config.password, function(err, res) {
        assert(err === undefined);
        assert(res === undefined);
      });
      client.once('close', function() {
        done();
      });
    });
    // test('chatstate')
    // test('presence')
    // test('receipt')
  });
})(this);