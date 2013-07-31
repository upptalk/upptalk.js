(function() {
  'use strict';

  var JID = Lightstring.JID;
  var Y = Yuilop;

  var routeStanza = function(stanza) {
    if (!(stanza instanceof Lightstring.Element))
      return;

    console.log(stanza);

    var from = new JID(stanza.attrs['from']);
    var to = new JID(stanza.attrs['to']);
    var type = stanza.attrs['type'];
    var name = stanza.name;
    var id = stanza.attrs['id'];

    //
    //message
    //
    if (name === 'message') {
      //
      //chatstate
      //
      if (type !== 'groupchat') {
        var chatstates = ['active', 'composing', 'paused', 'gone', 'inactive'];
        chatstates.forEach(function(chatstate) {
          var chatstateEl = stanza.getChild(chatstate, 'http://jabber.org/protocol/chatstates');
          if (chatstateEl) {
            Y.events.chatState({
              type: chatstate,
              from: from
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
          Y.events.receipt({
            type: receipt,
            from: from,
            message: id
          });
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
            value.thumbnail = {
              url: fileEl.attrs.thumbnail ? Lightstring.unescape(fileEl.attrs.thumbnail) : undefined
            };
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
              thumbnail: locationEl.attrs.thumbnail ? Lightstring.unescape(locationEl.attrs.thumbnail) : undefined,
            };
            var geolocEl = stanza.root().getChild('geoloc');
            if (geolocEl) {
              value.latitude = geolocEl.getChild('lat').getText();
              value.longitude = geolocEl.getChild('lon').getText();
            }
          }
        }

        var message = {
          from: from,
          id: id,
          type: type,
          value: value
        };

        //
        //delay
        //
        var delayEl = stanza.getChild('delay');
        if (delayEl)
          message.timestamp = delay.attrs['stamp'];
        //
        //nick
        //
        var nickEl = stanza.getChild('nick');
        if (nickEl)
          message.nick = nickEl.getText();
        //
        //title
        //
        var titleEl = stanza.getChild('title');
        if (titleEl)
          message.title = titleEl.getText();

        Y.events.message(message);
    }
    //
    //presence
    //
    else if (name === 'presence') {
      //
      //groupchat joined
      //
      if (id && !type && stanza.getChild('x', 'http://jabber.org/protocol/muc#user')) {
        return Y.events.newGroupchat({
          groupchat: from.bare,
          id: id
        })
      }
      //
      //user offline
      //
      if (type === 'unavailable') {
        return Y.events.presence({
          from: from,
          type: 'offline'
        });
      }
      //
      //user online
      //
      if (type !== 'unavailable') {
        return Y.events.presence({
          from: from,
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