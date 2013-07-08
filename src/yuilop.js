(function(window) {

'use strict';

var Yuilop = {
  login: null,
  password: null,
  connection: null,
  sendStanza: function(stanza, callback) {
    this.connection.send(stanza, callback);
  },
  //
  //Energy
  //
  getEnergyCosts: function(number, callback) {
    var stanza = (
      '<iq to="' + Yuilop.config['energy-service'] + '" type="get">' +
        '<energy xmlns="com.yuilop.energy#remaining"  from="' + Yuilop.connection.jid.bare + '" to="' + aNumber + '@' + Yuilop.config.domain + '">' +
          '<voice/>' +
          '<sms/>' +
        '</energy>' +
      '</iq>'
    );
    Yuilop.connection.send(stanza, function(answer) {
      if (answer.attr('type') !== 'result')
        return aCallback(true);

      var energyEl = answer.getChild('energy');
      if (!energyEl)
        return aCallback(true);

      var voiceEl = energyEl.getChild('voice');
      var smsEl = energyEl.getChild('sms');

      var remaining = {};
      if (voiceEl.attr('status') === 'allowed') {
        remaining.voice = voiceEl.attr('maxseconds');
      }
      else {
        remaining.voice = -2;
      }
      if (smsEl.attr('status') === 'allowed') {
        remaining.sms = smsEl.attr('maxamount') >= 999999 ? -1 : smsEl.attr('maxamount');
      }
      else {
        remaining.sms = -2;
      }
      aCallback(null, remaining);
    });
  }
};

window.Yuilop = Yuilop;

})(window);