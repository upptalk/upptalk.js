(function() {

  var logsEl;
  var statusEl;
  var y;

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

      y.send(message);
    });

    var connectEl = document.getElementById('connect');
    connectEl.addEventListener('submit', function(e) {
      e.preventDefault();

      var hostname = this.elements.hostname.value;
      var secure = this.elements.secure.checked;
      var port = this.elements.port.value;
      var username = this.elements.username.value;
      var password = this.elements.password.value;

      y = new Y({hostname: hostname, secure: secure, port: port});
      y.on('open', function() {
        view.setStatus('open');
        y.emit('ping', function() {});
      });
      y.on('close', function() {
        view.setStatus('closed');
      });
      y.on('message', function(message) {
        view.log('in', message);
      });
      y.on('send', function(message) {
        view.log('out', message);
      });
      y.on('error', function(err) {
        console.log(err);
      });


      y.open();

      if (username && password) {
        y.once('open', function() {
          y.emit('authenticate', {username: username, password: password}, function() {});
        });
      }
    });
  })
})();