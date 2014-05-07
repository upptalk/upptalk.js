(function() {

  'use strict';

  //not node.js
  if (typeof module === 'undefined' || !module.exports)
    return;

  var path = require('path');
  var fs = require('fs');

  var actionsPath = path.join(__dirname, 'lib', 'actions');
  var UppTalk = require(path.join(__dirname, 'lib', 'UppTalk.js'));

  fs.readdirSync(actionsPath).forEach(function(file) {
    var action = require(path.join(actionsPath, file));
    UppTalk.actions[action.method] = action.bind;
  });

  module.exports = UppTalk;

})();