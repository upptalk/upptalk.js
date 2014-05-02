(function(global) {

  'use strict';

  var logsEl;
  var statusEl;
  var client;
  var connectEl;
  var consoleEl;

  var view = {
    setStatus: function(status) {
      statusEl.textContent = status;
    },
    log: function(dir, message) {
      var logEl = document.createElement('div');
      logEl.classList.add(dir);
      if (typeof message !== 'string')
        message = JSON.stringify(message);
      logEl.textContent = message;

      if (!logsEl.hasChildNodes)
        logsEl.appendChild(logEl);
      else
        logsEl.insertBefore(logEl, logsEl.firstChild);
    }
  };

  var foo = {
    status: function(status) {
      statusEl.textContent = status;
    },
    connect: function(opts) {
      client = new UppTalk(opts);
      client.on('open', function() {
        foo.connected();
      });
      client.on('close', function() {
        foo.disconnected();
      });
      client.on('message', function(message) {
        view.log('in', message);
      });
      client.on('send', function(message) {
        view.log('out', message);
      });
      client.on('error', function(err) {
        console.log(err);
      });


      client.open();
    },
    connected: function() {
      connectEl.hidden = true;
      consoleEl.hidden = false;
      foo.status('open');
    },
    disconnected: function() {
      connectEl.hidden = false;
      consoleEl.hidden = true;
      foo.status('close');
    }
  };

  // window.y = y;

  document.addEventListener('DOMContentLoaded', function() {



    consoleEl = document.getElementById('console');
    connectEl = document.getElementById('connect');
    statusEl = document.getElementById('status');
    foo.disconnected();

    var options = localStorage.getItem('options');
    if (options) {
      options = JSON.parse(options),
      foo.connect(options);
    }
    else {
    }

    logsEl = document.getElementById('logs');

    var inputEl = document.getElementById('input');
    inputEl.addEventListener('submit', function(e) {
      e.preventDefault();

      var message = JSON.parse(this.elements.data.value);

      client.send(message);
    });

    connectEl.querySelector('form').addEventListener('submit', function(e) {
      e.preventDefault();

      var host = this.elements.host.value;
      var secure = this.elements.secure.checked;
      var port = this.elements.port.value;
      // var username = this.elements.username.value;
      // var password = this.elements.password.value;
      var apikey = this.elements.apikey.value;

      var options = {
        host: host,
        apikey: apikey,
        secure: secure,
        port: port
      };

      localStorage.setItem('options', JSON.stringify(options));


      foo.connect(options);
      // if (username && password) {
      //   client.once('open', function() {
      //     client.emit('authenticate', {username: username, password: password}, function() {});
      //   });
      // }
    });
  })
})(this);