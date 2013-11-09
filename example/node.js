'use strict';

var Y = require('..');
var config = require('../test/config');

var LOG = function(header, what) {
  console.log('');
  console.log(header);
  if (what)
    console.log(what);
  console.log('');
}

var client = new Y(config.url);
client.on('open', function() {
  LOG('OPEN')
  client.emit('authenticate', {username: config.username, password: config.password}, function(err) {
    if (err)
      return console.log(err);

    LOG('AUTHENTICATED');

    client.emit('presence');
    client.emit('ping', function(err, res) {
      console.log(err || res);
    });
    client.emit('energy', function(err, energy) {
      console.log(err || energy);
    });
  });
});
client.on('presence', function(payload) {
  console.log('presence:');
  console.log(payload);
});
client.on('message', function(stanza) {
  LOG('IN:', stanza);
});
client.on('send', function(stanza) {
  LOG('OUT:', stanza);
});
client.on('close', function() {
  LOG('CLOSED')
})
client.on('error', function(err) {
  LOG('ERRROR:', err);
});

client.use(ping);