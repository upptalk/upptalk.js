(function(global) {

  'use strict';

  var Conducto;
  var request;
  if (typeof module !== 'undefined' && module.exports) {
    Conducto = require('conducto-client');
    request = require('request.js');
  }
  else {
    Conducto = global.conducto.Client;
    request = global.request;
  }

  var defaultConfig = {
    hostname: 'happy.ym.ms',
    port: 443,
    secure: true
  };

  var Y = function(config) {
    config = config || defaultConfig;

    Conducto.call(this, config);

    for (var i in actions) {
      this.defineAction(i, actions[i]);
    }
  };
  Y.prototype = Conducto.prototype;
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

  var actions = {
    upload: function(file, callback, progress) {
      this.HTTPRequest({method: 'post', path: '/media', body: file}, callback, progress);
    }
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Y;
  else
    global.Y = Y;

})(this);

