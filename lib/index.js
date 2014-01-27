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

    //webrtc
    this.on('webrtc', function(p) {
      //supported
      if (this.call)
        this.handleWebRTCPacket(p);
      //unsupported
      else
        this.send('webrtc', {id: p.id, user: p.user, type: 'error'});
    });
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

