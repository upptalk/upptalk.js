(function(Y) {

  var Stanza = Y.Stanza;
  var services = Y.services;
  var send = Y.send;
  var getJID = Y.getJID;
  var JID = Y.JID;
  var unesc = Lightstring.unescape;
  var esc = Lightstring.escape;
  var request = Y.request;


  var emitter
    groupchats: function(callback) {
      this.request('groupchats', function(res) {
        callback(res.error, res.result);
      });
    },
    energy: function(callback) {
      this.request('energy',  function(res) {
        callback(res.error, res.result);
      });
    },
    contacts: function(payload, callback) {
      this.request('contacts', payload, function(res) {
        callback(res.error, res.result);
      })
    },
    remaining: function(payload, callback) {
      this.request('remaining', payload, function(res) {
        callback(res.error, res.result);
      })
    },
    message: function(payload) {
      this.notify('message', payload);
    },
    token: function() {
      var token;
      var callback;
      if (typeof arguments[0] === 'string') {
        token = arguments[0];
        callback = arguments[1];
      }
      else {
        callback = arguments[0];
      }

      //get
      if (!token) {
        var options = {
          method: 'GET',
          url: 'https://' + services['login'] + '/token'
        };
        request(options, function (err, res) {
          if (err)
            return callback(true);

          callback(null, res);
        });
      }
      //send
      else {
        var socket;

        var onMessage = function(e) {
          var message = JSON.parse(e.data);
          var result = message.result;
          if (!result)
            callback(message);
          else
            callback(null, result);

          close();
        };
        var close = function() {
          socket.removeEventListener('open', onOpen);
          socket.removeEventListener('close', onClose);
          socket.removeEventListener('error', onError);
          socket.removeEventListener('message', onMessage);
          socket.close();
        };
        var onClose = function() {
          socket.removeEventListener('open', onOpen);
          socket.removeEventListener('close', onClose);
          socket.removeEventListener('error', onError);
          socket.removeEventListener('message', onMessage);
          DEBUG('login tunnel closed');
          open();
        }
        var onOpen = function() {
          DEBUG('login tunnel opened');
          var request = {
            "jsonrpc": "2.0",
            "method": "token",
            "params": {
              "value": token,
            },
            "id": "1"
          };
          this.send(JSON.stringify(request));
        };
        var onError = function(e) {
          socket.removeEventListener('close', onClose);
          callback(true);
        };
        var open = function() {
          socket = new WebSocket('wss://' + services['happy']);
          socket.addEventListener('open', onOpen);
          socket.addEventListener('close', onClose);
          socket.addEventListener('error', onError);
          socket.addEventListener('message', onMessage);
        };
        open();
      }
    },
    storage: function(callback) {
      var req = {
        'method': 'get',
        'params': {
          'path': '/'
        }
      };
      this.sendRPC(req, function(res) {
        callback(res.error, res.result);
      });
    },  
    avatar: function(data, callback) {
      var options = {
        auth: true,
        url: 'https://' + services['happy'] + '/storage/devices/' + data.device + '/contacts/' + data.contact + '/avatar',
        //workaround safari, no support for responseType blob :/
        responseType: 'arraybuffer'
      };

      this.request(options, function(err, result) {
        if (err)
          return callback(err);

        var contentType = this.getResponseHeader('Content-Type');
        var blob = new Blob([result], {type: contentType});

        callback(null, blob);
      })
    },
    upload: function(file, callback, onProgress) {
      if (!(file instanceof Blob) && !(file instanceof File))
        return callback(new Error('Wrong data type'));

      this.request({
        method: 'POST',
        url: 'https://' + services['happy'] + '/media',
        auth: true,
        post: file
      }, function(err, result) {
        if (err)
          return callback(err);

        callback(null, JSON.parse(result));
      }, onProgress);
    }
  };


})(Yuilop);


