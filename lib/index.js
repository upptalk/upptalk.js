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
  Y.prototype.HTTPRequest = function(method, path, callback, progress) {
    request({
      method: method,
      url: this.urls.http + path,
      username: this.username,
      password: this.password,
      responseType: 'json'
    }, callback, progress);
  };

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Y;
  else if (typeof window !== 'undefined')
    window.Y = Y;


  var emitters = {
    upload: function(file, callback, progress) {
      if (!(file instanceof window.Blob) && !(file instanceof window.File))
        return callback(new Error('Wrong data type'));

      this.HTTPrequest('post', '/media', callback, progress);
    },
    captcha: function(callback) {
      this.HTTPrequest('get', '/captcha', callback);
    }
  };

})();


