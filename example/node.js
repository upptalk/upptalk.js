'use strict';

var Y = require('..');
var ping = require('../node_modules/conducto/lib/middleware/ping');

var LOG = function(header, what) {
  console.log('');
  console.log(header);
  if (what)
    console.log(what);
  console.log('');
}

var config = {
  username: '',
  password: '',
  port: 3232
}

var client = new Y();

client.open('ws://localhost:' + config.port);
client.on('open', function() {
  LOG('OPEN')
  client.emit('authenticate', {username: config.username, password: config.password}, function(err) {
    if (err)
      return console.log(err);

    LOG('AUTHENTICATED');

    client.emit('presence');
    client.emit('ping', function() {
      // console.log('lol')
    });
    client.emit('energy', function(err, energy) {
      console.log(err || energy);
    });
  });
  client.emit('ping', function() {
    console.log('pong')
  });
});
// client.on('presence', function(payload) {
//   console.log('presence:');
//   console.log(payload);
// });
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
// client.on('presence', function(payload, res, next) {
//   console.log('on presence')
//   next();
// });
// client.use(function(req, res, next) {
//   if (req.method === 'presence')
//     console.log('use presence');

//   next();
// });

client.use(ping);