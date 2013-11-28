(function() {

  'use strict';

  var config = {
    username: '',
    password: '',
    hostname: 'localhost',
    port: 9595,
    secure: false
  };


  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = config;
  else if (typeof window !== 'undefined')
    window.config = config;
})();
