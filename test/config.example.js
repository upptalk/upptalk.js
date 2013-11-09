(function() {

  'use strict';

  var config = {
    username: '',
    password: '',
    url: 'ws://localhost:9595'
  };


  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = config;
  else if (typeof window !== 'undefined')
    window.config = config;
})();
