(function(global) {

  'use strict';

  var action = {
    method: 'profile',
    bind: function(o) {
      var p = o.payload;
      var fn = o.callback;
      var onprogress = o.arguments[0];
      if (
        typeof p !== 'object' ||
        !p.avatar ||
        typeof Blob === 'undefined' ||
        typeof File === 'undefined' ||
        (!(p.avatar instanceof Blob) && !(p.avatar instanceof File))
      )
        return false;

      var options = {
        path: '/avatar',
        method: 'POST',
        body: p.avatar,
        port: 443,
        secure: true,
        host: 'happy.ym.ms'
      };

      var that = this;

      var req = this.http.request(options);
      req.onresponse = function(res) {
        res.onend = function(body) {
          var url = (
            (options.secure ? 'https' : 'http') +
            '://' + options.host + ':' + options.port +
            options.path + '/' + body.toString()
          );
          p.avatar = url;

          that.request('profile', p, function(err) {
            fn(err, p);
          });
        };
      };
      req.onprogress = function(sent, total) {
        if (typeof onprogress === 'function')
          onprogress(sent, total);
        if (fn.promise && typeof fn.promise.onprogress === 'function')
          fn.promise.onprogress(sent, total);
      };
      req.onerror = function(err) {
        fn(err);
      };
    }
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = action;
  else
    global.UppTalk.actions[action.method] = action.bind;

})(this);