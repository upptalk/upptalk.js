(function() {

  'use strict';

  var Enchufe = function(service) {
    this.socket = null;
    this.service = service || null;
    this.callbacks = {};
  };
  Enchufe.prototype = {
    open: function(callback) {
      this.socket = new WebSocket(this.service, 'json-rpc');
      if (callback)
        this.socket.addEventListener('open', function() {
          callback()
        });

      this.handleSocket();
    },
    handleSocket: function() {
      var socket = this.socket;
      socket.addEventListener('message', (function(e) {
        var message = e.data;
        try {
          message = JSON.parse(message);
        }
        catch (e) {
          return;
        }

        if (message.id && this.callbacks[message.id]) {
          this.callbacks[message.id](message);
          delete this.callbacks[message.id];
        }
      }).bind(this));
      socket.addEventListener('close', (function() {
        this.open();
      }).bind(this));
    },
    send: function(request, callback) {
      if (callback) {
        if (!request.id)
          request.id = Math.random();

        this.callbacks[request.id] = callback;
      }
      if (!request.jsonrpc)
        request.jsonrpc = '2.0';

      this.socket.send(JSON.stringify(request));  
    },
    ping: function(callback) {
      var req = {
        method: 'ping'
      };
      this.send(req, function(res) {
        callback(res.error, res.result);
      });
    },
    authenticate: function(username, password, callback) {
      var req = {
        "method": 'auth',
        "params": {
          "username": username,
          "password": password
        }
      };
      this.send(req, function(res) {
        callback(res.error, res.result);
      });
    }
  };

  window.Enchufe = Enchufe;

})();