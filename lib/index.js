(function() {
  'use strict';

  var conducto
  if (typeof window !== 'undefined') {
    conducto = window.conducto;
  }
  else {
    conducto = require('../node_modules/conducto');
  }

  var Y = function(url) {
    conducto.Client.call(this, url);
  };
  Y.prototype = new conducto.Client();

  var methods = {
  };
  for (var i in methods)
    Y.prototype[i] = methods[i];

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Y;
  else
    window.Y = Y;


})();