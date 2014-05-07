(function() {

  'use strict';

  //not node.js
  if (typeof module === 'undefined' || !module.exports)
    return;

  var path = require('path');
  var fs = require('fs');

  var actionsPath = path.join(__dirname, 'lib', 'actions');
  var UppTalk = require(path.join(__dirname, 'lib', 'UppTalk.js'));

  var actions = fs.readdirSync(actionsPath);
  actions.forEach(function(p) {
    var action = require(path.join(actionsPath, p));
    UppTalk.actions[action.method] = action.bind;
  });

  module.exports = UppTalk;

})();