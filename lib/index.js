(function() {
  'use strict';

  var conducto;
  if (typeof conducto === 'undefined' && typeof require !== 'undefined')
    conducto = require('conducto');
  else
    conducto = window.conducto;

  var request;
  if (typeof request === 'undefined' && typeof require !== 'undefined')
    request = require('request.js');
  else
    request = window.request;

  var defaultConfig = {
    hostname: 'happy.ym.ms',
    port: 443,
    secure: true
  };

  var Y = function(config) {
    if (typeof config === 'string')
      config = {hostname: config};
    else if (!config)
      config = defaultConfig;

    this.hostname = config.hostname;
    this.secure = typeof config.secure === 'boolean' ? config.secure : true;
    this.port = config.port || (this.secure === true ? 443 : 80);
    this.urls = {
      websocket: (this.secure ? 'wss' : 'ws') + '://' + this.hostname + ':' + this.port,
      http: (this.secure ? 'https' : 'http') + '://' + this.hostname + ':' + this.port,
    };

    conducto.Client.call(this, this.urls.websocket);

    for (var i in emitters) {
      this.defineEmitter(i, emitters[i]);
    }
  };
  Y.prototype = new conducto.Client();
  Y.prototype.HTTPRequest = function(opts, callback, progress) {
    var options = {
      url: this.urls.http + opts.path,
      username: this.username,
      password: this.password
    };
    if (opts.auth === false) {
      delete options.username;
      delete options.password;
      delete opts.auth;
    }
    delete opts.path;
    for (var i in opts)
      options[i] = opts[i];

    request(options, callback, progress);
  };

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Y;
  else if (typeof window !== 'undefined')
    window.Y = Y;


  var emitters = {
    upload: function(file, callback, progress) {
      this.HTTPRequest({method: 'post', path: '/media', body: file}, callback, progress);
    },
    captcha: function(callback) {
      this.HTTPRequest({method: 'get', path: '/captcha', auth: false}, function(err, body) {
        if (err)
          return callback({message: 'Internal client error'});

        callback(body.error, body.result);
      });
    },
  };

})();

