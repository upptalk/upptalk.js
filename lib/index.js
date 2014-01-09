(function(global) {
  'use strict';

  var conducto;
  var request;
  if (typeof module !== 'undefined' && module.exports) {
    conducto = require('conducto');
    request = require('request.js');
  }
  else {
    conducto = global.conducto;
    request = global.request;
  }

  var defaultConfig = {
    hostname: 'happy.ym.ms',
    port: 443,
    secure: true
  };

  var Y = function(config) {
    config = config || defaultConfig;

    conducto.Client.call(this, config);

    for (var i in emitters) {
      this.defineEmitter(i, emitters[i]);
    }
  };
  Y.prototype = conducto.Client.prototype;
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

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Y;
  else
    global.Y = Y;

})(this);

