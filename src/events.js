(function() {
  'use strict';

  var JID = Lightstring.JID;
  var Y = Yuilop;

  var routeStanza = function(stanza) {
    if (!(stanza instanceof Lightstring.Element))
      return;

    var type = stanza.attrs['type'];
    var from = new JID(stanza.attrs['from']);
    var to = new JID(stanza.attrs['to']);
    var name = stanza.name;
    var id = stanza.attrs['id'];
    //
    //message
    //
    if (name === 'message') {
      //error, receipt error event
      if (type === 'error') {
        var event = {
          type: 'error',
          id: id
        };
        if (type === 'groupchat') {
          event.groupchat = from.local;
          event.participant = from.resource;
        }
        else {
          event.user = from.local;
        }
        return Y.event('receipt', event);
      }
      //don't fire message event if the message was sent from this device
      var test = type === 'groupchat' ? from.local : from;
      if (Y.wasSentFromThisDevice(test, id, type))
        return
      //
      //chatstate
      //
      if (type !== 'groupchat') {
        var chatstates = ['active', 'composing', 'paused', 'gone', 'inactive'];
        chatstates.forEach(function(chatstate) {
          var chatstateEl = stanza.getChild(chatstate, 'http://jabber.org/protocol/chatstates');
          if (chatstateEl) {
            Y.event('chatstate', {
              type: chatstate,
              user: from.local
            });
            return;
          }
        });
      }
      //
      //receipt
      //
      ['received', 'read', 'sent', 'failed'].forEach(function(receipt) {
        var childEl = stanza.getChild(receipt, 'urn:xmpp:receipts');
        if (childEl) {
          var event = {
            type: receipt,
            id: childEl.attrs['id']
          };
                                   //WORKAROUND CORE-1533
          if (type === 'groupchat' || (from.domain === Y.services['groupchat'])) {
            event.groupchat = from.local;
          }
          else if (from.domain === Y.services['sms']) {
            event.number = from.local;
          }
          else {
            event.user = from.local;
          }
          Y.event('receipt', event);
        }
      });
      //
      //chat
      //
      var bodyEl = stanza.getChild('body');
      if (!bodyEl)
        return;

        var value;
        //
        //multimedia
        //
        var multimediaEl = stanza.getChild('multimedia');
        if (!multimediaEl)
          value = bodyEl.text();
        else {
          //
          //file
          //
          var fileEl = multimediaEl.getChild('file');
          if (fileEl) {
            var value = {};
            value.multimedia = 'file';
            value.type = fileEl.attrs.type;
            value.url = fileEl.attrs.url ? Lightstring.unescape(fileEl.attrs.url) : undefined;
                                          //hack, ANDROID-3790
            if (fileEl.attrs.thumbnail && !value.type.match('audio/')) {
              value.thumbnail = {
                url: fileEl.attrs.thumbnail ? Lightstring.unescape(fileEl.attrs.thumbnail) : undefined
              };
            }
            value.size = fileEl.attrs.size,
            value.name = fileEl.attrs.name ? Lightstring.unescape(fileEl.attrs.name) : undefined;
          }
          //
          //location
          //
          var locationEl = multimediaEl.getChild('location');
          if (locationEl) {
            var value = {
              multimedia: 'location',
              url: locationEl.attrs.url ? Lightstring.unescape(locationEl.attrs.url) : undefined,
            };
            if (locationEl.attrs.thumbnail) {
              value.thumbnail = {
                url: Lightstring.unescape(locationEl.attrs.thumbnail)
              }
            }
            var geolocEl = stanza.root().getChild('geoloc');
            if (geolocEl) {
              value.latitude = geolocEl.getChild('lat').getText();
              value.longitude = geolocEl.getChild('lon').getText();
            }
          }
        }

        var message = {
          id: id,
          message: value
        };

        if (type === 'groupchat') {
          message.groupchat = from.local;
          message.user = from.resource;
        }
        else {
          message.user = from.local;
          message.device = from.resource;
        }

        //
        //receipt
        //
        var receiptEl = stanza.getChild('request', 'urn:xmpp:receipts');
        if (receiptEl)
          message.receipt = true;
        //
        //delay
        //
        var delayEl = stanza.getChild('delay');
        if (delayEl)
          message.timestamp = delayEl.attrs['stamp'];
        //
        //nick
        //
        var nickEl = stanza.getChild('nick');
        if (nickEl)
          message.name = nickEl.getText();
        //
        //title
        //
        var titleEl = stanza.getChild('title');
        if (titleEl)
          message.title = titleEl.getText();

        Y.event('message', message);
    }
    //
    //presence
    //
    else if (name === 'presence') {
      //
      //groupchat joined
      //
      if (id && !type && stanza.getChild('x', 'http://jabber.org/protocol/muc#user')) {
        return Y.event('groupchat', {
          groupchat: from.bare,
          id: id
        });
      }
      //
      //user offline
      //
      if (type === 'unavailable') {
        return Y.event('presence', {
          user: from.local,
          type: 'offline'
        });
      }
      //
      //user online
      //
      if (type !== 'unavailable') {
        return Y.event('presence', {
          user: from.local,
          type: 'online'
        });
      }
    }
    //
    //iq
    //
    else if (name === 'iq') {
      //
      //disco info
      //
      if (type ==='get' && stanza.getChild('query', 'http://jabber.org/protocol/disco#info')) {
        var stanza = (
          '<iq to="' + from + '" id="' + id + '" type="result">' +
            '<query xmlns="http://jabber.org/protocol/disco#info">' +
              '<feature var="jabber:iq:version"/>' +
              '<feature var="urn:xmpp:receipts"/>' +
              '<feature var="com.yuilop.multimedia"/>' +
              '<feature var="urn:xmpp:ping"/>' +
              '<feature var="http://jabber.org/protocol/muc"/>' +
              '<feature var="http://jabber.org/protocol/chatstates"/>' +
            '</query>' +
          '</iq>'
        );
        Y.send(stanza);
      }
      //
      //software version
      //
      else if (type === 'get' && stanza.getChild('query', 'jabber:iq:version')) {
        var stanza = (
          '<iq type="result" to="' + stanza.from + '" id="' + stanza.id + '">' +
            '<query xmlns="jabber:iq:version">' +
              '<name>yuilop</name>' +
              '<version>1.0</version>' +
              '<os>web</os>' +
            '</query>' +
          '</iq>'
        );
        Y.send(stanza);
      }
      //
      //ping http://xmpp.org/extensions/xep-0199.html
      //
      else if (type === 'get' && stanza.getChild('ping')) {
        Y.send(
          '<iq to="' + from + '" id="' + id + '" type="result"/>'
        );
      }
      else if (type !== 'result' && type !== 'error') {
        var stanza = (
          '<iq id="' + id + '" to="' + from.bare + '" type="error">' +
            '<error type="cancel">' +
              '<feature-not-implemented xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"/>' +
            '</error>' +
          '</iq>'
        )
        this.send(stanza);
      }
    }
  };
  Y.routeStanza = routeStanza;
})();