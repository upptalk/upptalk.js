(function(global) {

  'use strict';

  var config = {
    username: '',
    password: '',
    apikey: '',
    host: 'localhost',
    port: 9595,
    secure: false
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = config;
  else
    global.config = config;

})(this);
