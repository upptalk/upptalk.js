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
    loginBarcode: function(token) {
      var data = document.location.protocol + '//' + document.location.host + '/barcode?token=' + token;
      var qr = new JSQR();
      var code = new qr.Code();
      code.encodeMode = code.ENCODE_MODE.BYTE;
      code.version = code.DEFAULT;
      code.errorCorrection = code.ERROR_CORRECTION.H;
      var input = new qr.Input();
      input.dataType = input.DATA_TYPE.TEXT;
      input.data = data;
      var matrix = new qr.Matrix(input, code);
      matrix.scale = 4;
      matrix.margin = 0;
      var canvas = document.createElement('canvas');
      canvas.setAttribute('width', matrix.pixelWidth);
      canvas.setAttribute('height', matrix.pixelWidth);
      canvas.getContext('2d').fillStyle = 'rgb(0,0,0)';
      matrix.draw(canvas, 0, 0);
      return canvas;
    },
  };
  for (var i in methods)
    Y.prototype[i] = methods[i];

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Y;
  else
    window.Y = Y;


})();