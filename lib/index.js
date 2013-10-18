(function() {
  'use strict';

  var conducto
  if (typeof window !== 'undefined') {
    conducto = window.conducto;
  }
  else {
    conducto = require('../node_modules/conducto');
  }


  var exports = function(url) {
    return new conducto.Client(url);
  };

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = exports;
  else
    window.Y = exports;


})();