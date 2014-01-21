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
    host: 'happy.ym.ms',
    port: 443,
    secure: true
  };

  var UppTalk = function(config) {
    config = config || defaultConfig;
    if (config.apikey) {
      config.query = {
        apikey: config.apikey
      };
      this.apikey = config.apikey;
    }

    Conducto.call(this, config);

    for (var i in actions) {
      this.defineAction(i, actions[i]);
    }
  };
  UppTalk.prototype = Conducto.prototype;

  var actions = {
    upload: function(file, callback, progress) {
      this.HTTPRequest({method: 'post', path: '/media', body: file}, callback, progress);
    }
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = UppTalk;
  else
    global.UppTalk = UppTalk;

})(this);

