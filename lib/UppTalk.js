(function(global) {

  'use strict';

  var Conducto;
  var utils;
  if (typeof module !== 'undefined' && module.exports) {
    Conducto = require('conducto-client');
    utils = Conducto.utils;
  }
  else {
    Conducto = global.conducto.Client;
    utils = global.conducto.utils;
  }

  var defaultConfig = {
    host: 'happy.ym.ms',
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

    config.query = config.query || {};

    //API key
    if (config.apikey) {
      config.query.apikey = config.apikey;
      this.apikey = config.apikey;
    }

    Conducto.call(this, config);

    for (var j in UppTalk.actions) {
      this.define(j, UppTalk.actions[j]);
    }
  };
  UppTalk.actions = {};
  UppTalk.prototype = Conducto.prototype;

  if (typeof module !== 'undefined' && module.exports)
    module.exports = UppTalk;
  else {
    global.UppTalk = UppTalk;
  }

})(this);

