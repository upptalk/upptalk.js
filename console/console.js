(function(global) {

  var logsEl;
  var statusEl;
  var client;

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

  // window.y = y;

  document.addEventListener('DOMContentLoaded', function() {
    statusEl = document.getElementById('status');
    logsEl = document.getElementById('logs');

    var inputEl = document.getElementById('input');
    inputEl.addEventListener('submit', function(e) {
      e.preventDefault();

      var message = JSON.parse(this.elements.data.value);

      client.send(message);
    });

    var connectEl = document.getElementById('connect');
    connectEl.addEventListener('submit', function(e) {
      e.preventDefault();

      var hostname = this.elements.hostname.value;
      var secure = this.elements.secure.checked;
      var port = this.elements.port.value;
      var username = this.elements.username.value;
      var password = this.elements.password.value;
      var apikey = this.elements.apikey.value;

      client = new UppTalk({apikey: apikey, hostname: hostname, secure: secure, port: port});
      client.on('open', function() {
        view.setStatus('open');
        client.send('ping', function() {});
      });
      client.on('close', function() {
        view.setStatus('closed');
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

      if (username && password) {
        client.once('open', function() {
          client.emit('authenticate', {username: username, password: password}, function() {});
        });
      }
    });
  })
})(this);