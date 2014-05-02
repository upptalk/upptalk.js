(function(global) {

  'use strict';

  var Conducto;
  var Promise;
  if (typeof module !== 'undefined' && module.exports) {
    Conducto = require('conducto-client');
    Promise = Conducto.utils.Promise;
  }
  else {
    Conducto = global.conducto.Client;
    Promise = global.conducto.utils.Promise;
  }

  var defaultConfig = {
    host: 'happy.dev.ym.ms',
    port: 443,
    secure: true
  };

  var UppTalk = function(config) {
    if (typeof config === 'object') {
      for (var i in defaultConfig) {
        if (!(i in config))
          config[i] = defaultConfig[i];
      }
    }
    else {
      config = defaultConfig;
    }

    if (config.apikey) {
      config.query = {
        apikey: config.apikey
      };
      this.apikey = config.apikey;
    }

    Conducto.call(this, config);

    for (var j in actions) {
      this.defineAction(j, actions[j]);
    }
  };
  UppTalk.prototype = Conducto.prototype;

  var actions = {
    chat: function(p, fn, onprogress) {
      if (
        !p.file ||
        typeof Blob === 'undefined' ||
        typeof File === 'undefined' ||
        (!(p.file instanceof Blob) && !(p.file instanceof File))
      )
        return this.request('chat', p, fn);

      var options = {
        path: '/media',
        method: 'POST',
        body: p.file,
        port: 443,
        secure: true,
        host: 'happy.ym.ms'
      };

      var that = this;

      var promise;
      var resolve;
      var reject;
      if (Promise) {
        promise = new Promise(function(res, rej) {
          resolve = res;
          reject = rej;
        });
      }

      var req = this.http.request(options);
      req.onresponse = function(res) {
        res.onend = function(body) {
          body = JSON.parse(body.toString());
          p.file = body.file;
          if (body.thumbnail)
            p.file.thumbnail = body.thumbnail;

          that.request('chat', p,
            function(err) {
              if (err) {
                if (fn) fn(err);
                if (reject) reject(err);
                return;
              }

              if (fn) fn(null, body);
              if (resolve) resolve(body);
            }
          );
        };
      };
      req.onprogress = function(sent, total) {
        if (onprogress)
          onprogress(sent, total);
        if (promise && promise.onprogress)
          promise.onprogress(sent, total);
      };
      req.onerror = function(err) {
        if (fn) fn(err);
        if (reject) reject(err);
      };

      return promise;
    }
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = UppTalk;
  else
    global.UppTalk = UppTalk;

})(this);

