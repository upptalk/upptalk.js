/*
 * sets client.username and client.password once authenticated
 */

(function(global) {

  'use strict';

  var action = {
    method: 'authenticate',
    bind: function(o) {
      var p = o.payload;
      var fn = o.callback;
      if (
        !p &&
        typeof p !== 'object' &&
        typeof p !== 'string'
      )
        return false;

      if (p.username && p.password) {
        this.username = p.username;
        this.password = p.password;
      }

      var client = this;

      this.request('authenticate', p, function(err, res) {
        if (!err && res && (res.username && res.password)) {
          client.username = res.username;
          client.password = res.password;
        }
        fn(err, res);
      });
    }
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = action;
  else
    global.UppTalk.actions[action.method] = action.bind;

})(this);