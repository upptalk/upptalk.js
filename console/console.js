(function() {

  var y = new Y();
  y.on('open', function() {
    view.setStatus('open');
  });
  y.on('close', function() {
    view.setStatus('close');
  });
  y.on('message', function(message) {
    view.log('in', message);
  });
  y.on('send', function(message) {
    view.log('out', message);
  })

  var statusEl;

  var view = {
    setStatus: function(status) {
      statusEl.textContent = status;
    },
    log: function(dir, message) {
      var logEl = document.createElement('div');
      logEl.textContent = JSON.stringify(message);
    }
  };

  window.y = y;

  document.addEventListener('DOMContentLoaded', function() {
    statusEl = document.getElementById('status');

    var inputEl = document.getElementById('input');
    inputEl.addEventListener('submit', function(e) {
      e.preventDefault();

      y.sendStanza(this.elements['value']);
    })
  })
})();