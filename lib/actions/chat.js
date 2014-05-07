(function(global) {

  'use strict';

  var action = {
    method: 'chat',
    bind: function(o) {
      var p = o.payload;
      var fn = o.callback;
      var onprogress = o.arguments[0];
      if (
        typeof p !== 'object' ||
        !p.file ||
        typeof Blob === 'undefined' ||
        typeof File === 'undefined' ||
        (!(p.file instanceof Blob) && !(p.file instanceof File))
      )
        return false;

      var options = {
        path: '/media',
        method: 'POST',
        body: p.file,
        port: 443,
        secure: true,
        host: 'happy.ym.ms'
      };

      var that = this;

      var req = this.http.request(options);
      req.onresponse = function(res) {
        res.onend = function(body) {
          body = JSON.parse(body.toString());
          p.file = body.file;
          if (body.thumbnail)
            p.file.thumbnail = body.thumbnail;

          that.request('chat', p, function(err) {
            fn(err, body);
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