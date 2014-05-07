(function(global) {

  'use strict';

  var config = global.config;
  var UppTalk = global.UppTalk;

  var form = document.querySelector('form');
  var submit = form.elements.submit;

  var client = new UppTalk(config);
  client.on('open', function() {
    console.log('OPEN');
  });
  client.on('close', function() {
    console.log('CLOSE');
    submit.disabled = true;
  });
  client.on('send', function(m) {
    console.log('OUT:', m);
  });
  client.on('message', function(m) {
    console.log('IN:', m);
  });
  client.open(function() {
    client.exec('authenticate', {username: config.username, password: config.password}, function(err) {
      if (err)
        return console.error(err);

      submit.disabled = false;
    });
  });

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var p = client.exec('chat', {
        user: form.elements.user.value,
        file: form.elements.file.files[0],
        id: Math.random().toString()
      },
      //callback style:
      function(err, res) {
        if (err)
          return console.log('callback error', err);

        console.log('callback done', res);
      },
      function(sent, total) {
        console.log('callback progress', (sent * 100 / total) + '%');
      }
    );
    //promise style:
    p.then(function(res) {
      console.log('promise done', res);
    });
    p.onprogress = function(sent, total) {
      console.log('promise progress', (sent * 100 / total) + '%');
    };
    p.catch(function(err) {
      console.log('promise error', err);
    });
  });

})(this);