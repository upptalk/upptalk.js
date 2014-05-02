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
        console.log('callback done', err, res);
      },
      function(sent, total) {
        console.log('callback progress', ((sent * 100) / total) + '%');
      }
    );
    //promise style :
    p.then(function(res, err) {
      console.log('promise done', err, res);
    });
    p.onprogress = function(sent, total) {
      console.log('promise progress', ((sent * 100) / total) + '%');
    };
  });

})(this);