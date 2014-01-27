(function(window) {

  'use strict';

  var LOG = function(header, what) {
    console.log('');
    console.log(header);
    if (what)
      console.log(what);
    console.log('');
  };

  var client = new window.UppTalk({apikey: window.config.apikey});
  client.open();
  client.on('open', function() {
    LOG('OPEN');
    client.send('authenticate', {username: window.config.username, password: window.config.password}, function(err) {
      if (err)
        return console.log(err);

      LOG('AUTHENTICATED');

      client.send('presence');
      // client.send('ping', function() {
        // console.log('lol')
      // });
      // client.send('energy', function(err, energy) {
      //   console.log(err || energy);
      // });
    });
    // client.send('ping', function() {
    //   console.log('pong')
    // });
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
    LOG('CLOSED');
  });
  client.on('error', function(err) {
    LOG('ERRROR:', err);
  });


  // var client = new conducto.Client();
  // client.open('ws://localhost:3232');
  // client.on('open', function() {
  //   console.log('OPEN');
  //   client.emit('ping', function() {
  //     console.log('pong')
  //   })
  // });
  // client.on('error', function(err) {
  //   console.log(err)
  // })
  // client.on('close', function() {
  //   console.log('close')
  // })

})(this);

