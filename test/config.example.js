(function(global) {

  'use strict';

  var config = {
    username: '',
    password: '',
    apikey: '',
    host: 'localhost',
    port: 9595,
    secure: false,
    turn: {
      url: '',
      username: '',
      credential: ''
    }
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = config;
  else
    global.config = config;

})(this);
