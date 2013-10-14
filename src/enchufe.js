(function() {

  'use strict';

  var debug = true;

  var DEBUG = function(message) {
    if (debug)
      console.debug(message);
  };
  var ERROR = function(e) {
    console.error(e);
  }

  var Enchufe = function(service) {
    this.socket = null;
    this.service = service || null;
    this.callbacks = {};
    this.username = null;
    this.password = null;
    // this.lastActivity = null;
    // this.timeout = null;
    // this.pingInterval = 10000;
    // this.pongTimeout = 2000;
    // this.pongTimeoutFun = null;
    // this.reconnectInterval = 2000;
    // this.autoAuth = true;
  };
  Enchufe.prototype = {
    open: function(callback) {
      this.socket = new WebSocket(this.service, 'json-rpc');
      if (callback) {
        this.socket.addEventListener('open', (function() {
          callback()
        }).bind(this));
      }

      this.handleSocket();
    },
    // newActivity: function(timestamp) {
    //   if (!this.lastActivity || this.timeout || timestamp - this.lastActivity < this.pingInterval) {
    //     clearTimeout(this.timeout);
    //     this.timeout = setTimeout((function() {
    //       var received;
    //       this.pongTimeoutFun = setTimeout((function() {
    //         this.socket.close();
    //         clearTimeout(this.timeout);
    //         delete this.timeout;
    //       }).bind(this), this.pongTimeout);
    //       this.ping(function() {
    //         clearTimeout(this.pongTimeoutFun);
    //       });
    //     }).bind(this), this.pingInterval);
    //   }
    //   this.lastActivity = timestamp;
    // },
    handleSocket: function() {
      var socket = this.socket;
      socket.addEventListener('message', (function(e) {
        // this.newActivity(Date.now());
        var message = e.data;
        try {
          message = JSON.parse(message);
        }
        catch (e) {
          return;
        }

        DEBUG('enchufe in:')
        DEBUG(message);

        if (message.id && this.callbacks[message.id]) {
          this.callbacks[message.id](message);
          delete this.callbacks[message.id];
        }
      }).bind(this));
      // socket.addEventListener('close', (function() {
      //   clearTimeout(this.pongTimeoutFun);
      //   clearTimeout(this.timeout);
      //   setTimeout((function() {
      //     this.open();
      //   }).bind(this), this.reconnectInterval);
      // }).bind(this));
    },
    send: function(request, callback) {
      if (callback) {
        if (!request.id)
          request.id = Math.random();

        this.callbacks[request.id] = callback.bind(this);
      }
      if (!request.jsonrpc)
        request.jsonrpc = '2.0';

      DEBUG('enchufe out:')
      DEBUG(request);
      this.socket.send(JSON.stringify(request));  
    },
    ping: function(callback) {
      var req = {
        method: 'ping'
      };
      callback = callback.bind(this)
      this.send(req, function(res) {
        callback(res.error, res.result);
      });
    },
    authenticate: function(username, password, callback) {
      this.username = username;
      this.password = password;
      var req = {
        "method": 'auth',
        "params": {
          "username": this.username,
          "password": this.password
        }
      };
      this.send(req, function(res) {
        callback(res.error, res.result);
      });
    }
  };

  window.Enchufe = Enchufe;

})();