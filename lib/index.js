(function(exports) {
  'use strict';

  var conducto;
  if (typeof conducto === 'undefined' && typeof require !== 'undefined')
    conducto = require('conducto');
  else
    conducto = window.conducto;

  var request;
  if (typeof request === 'undefined' && typeof require !== 'undefined')
    request = require('request.js');
  else
    request = window.request;

  var Y = function(url) {
    conducto.Client.call(this, url);

    this.defineEmitter('upload', function(file, callback, progress) {
      if (!(file instanceof Blob) && !(file instanceof File))
        return callback(new Error('Wrong data type'));

      request({
        method: 'POST',
        url: 'http://localhost:9595/media', //FIXME
        username: this.username + '@ym.ms', //FIXME
        password: this.password,
        post: file,
        responseType: 'json'
      }, callback, progress);
    });
  };
  Y.prototype = new conducto.Client();

  // var proto = {
  // };
  // for (var i in proto)
  //   Y.prototype[i] = proto[i];

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Y;
  else if (typeof window !== 'undefined')
    window.Y = Y;

})();


