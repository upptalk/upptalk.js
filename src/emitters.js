(function(Y) {

	var Stanza = Y.Stanza;
  var services = Y.services;
  var send = Y.send;
  var getJID = Y.getJID;
  var JID = Y.JID;
  var unesc = Lightstring.unescape;
  var esc = Lightstring.escape;
  var request = Y.request;

	Y.emitters = {
  	presence: function(data, callback) {
      var stanza = new Stanza('<presence/>');

      if (data) {
      	if (data.type !== 'online')
      		stanza.attrs.type = 'unavailable';
      	if (data.groupchat) {
      		stanza.attrs.to = getJID(to, services['groupchat']);
      	}
      }
      send(stanza);
      //FIXME, listen for groupchat presence event to call callback
      if (callback)
      	callback();
  	},
  	receipt: function(data) {
  		var jid;
  		var stanzaType;
  		if (data.groupchat) {
  			jid = getJID(data.groupchat,	services['groupchat']);
  			stanzaType = 'groupchat';
  		}
  		else if (data.user) {
  			jid = getJID(data.user, Y.domain);
  			stanzaType = 'chat';
  		}

      var stanza = (
        '<message type="' + stanzaType + '" to="' + jid + '">' +
          '<' + data.type + ' xmlns="urn:xmpp:receipts" id="' + data.id + '"/>' +
        '</message>'
       );

      send(stanza);
  	},
    chatstate: function(data) {
      var jid = getJID(data.user, Y.domain);
      var stanza = (
        '<message to="' + jid + '" type="chat">' +
          '<' + data.type + ' xmlns="http://jabber.org/protocol/chatstates"/>' +
        '</message>'
      );
      send(stanza);
    },
  	lastactivity: function(data, callback) {
      var jid = getJID(data.user, Y.domain);
      var stanza = new Stanza(
        '<iq type="get">' +
          '<query xmlns="jabber:iq:last"/>' +
        '</iq>'
      );
      callback = callback || Function();
      send(jid, stanza, function(err, res) {
        if (err)
          return callback(true);

        var queryEl = res.getChild('query', 'jabber:iq:last');
        if (!queryEl)
          return callback();

        var seconds = queryEl.attrs['seconds'];
        if (!seconds)
          return callback();

        callback(null, seconds);
        // var date = new Date(parseInt(seconds));
        // callback(null, date);
      });
	  },
    participants: function(data, callback) {
      var jid = getJID(data.groupchat, services['groupchat']);
      var stanza = new Stanza(
        '<iq type="get">' +
          '<query xmlns="http://jabber.org/protocol/muc#admin"/>' +
        '</iq>'
      );
      send(jid, stanza, function(err, res) {
        if (err)
          return callback(true);

        var queryEl = res.getChild('query');
        var itemsEl = queryEl.getChildren('item');
        var participants = [];
        for (var i = 0, length = itemsEl.length; i < length; i++) {
          participants.push({
            user: new JID(itemsEl[i].attrs.jid).local,
            name: itemsEl[i].attrs.nick || this.jid.local,
            affiliation: itemsEl[i].attrs.affiliation,
            role: itemsEl[i].attrs.role,
          });
        }

        callback(null, participants)
      });
    },
    groupchats: function(callback) {
      var jid = getJID(services['groupchat']);
      var stanza = (
        '<iq type="get">' +
          '<query xmlns="http://jabber.org/protocol/disco#items"/>' +
        '</iq>'
      );
      send(jid, stanza, function(err, result) {
        if (err)
          return callback(true);

        var queryEl = result.getChild('query');
        var itemsEl = queryEl.getChildren('item');
        var groupchats = [];
        for (var i = 0, length = itemsEl.length; i < length; i++) {
          groupchats.push({
            id: new JID(itemsEl[i].attrs.jid).local,
            name: itemsEl[i].attrs.name,
          });
        }
        callback(null, groupchats);
      });
    },
    message: function(data) {
      var jid;
      var stanzaType;
      if (data.groupchat) {
        jid = getJID(data.groupchat, services['groupchat']);
        stanzaType = 'groupchat';
      }
      else if (data.user) {
        jid = getJID(data.user, Y.domain);
        stanzaType = 'chat';
      }
      else {
        jid = getJID(data.number, services['sms'])
        stanzaType = 'chat';
      }

      var stanza = buildMessageStanza(data.message);
      stanza.attrs.type = stanzaType;
      var id = stanza.attrs.id;

      send(jid, stanza);
      //don't fire message event if the message was sent from this device
      if (stanzaType === 'groupchat') {
        var hackId = jid.local + '/' + id;
        this.sentFromThisDeviceHack[hackId] = true;
      }

      return id;
    },
    energy: function(callback) {
      var jid = getJID(services['energy']);

      var stanza = (
        '<iq type="get">' +
          '<energy xmlns="com.yuilop.energy"/>' +
        '</iq>'
      );
      send(jid, stanza, function(err, res) {
        if (err)
          return callback(err);

        var energyEl = res.getChild('energy');
        if (!energyEl)
          return callback(res);
        var energy = energyEl.attrs['energy'];
        if (!energy)
          return callback(res);

        callback(null, energy);
      });
    },
    phones: function(data, callback) {
      var jid = this.getJID(data.user, services['user']);
      var stanza = (
        '<iq type="get">' +
          '<contacts xmlns="com.yuilop.contact"/>' +
        '</iq>'
      );
      send(jid, stanza, function(err, stanza) {
        if (err)
          return callback(err);

        var phones = {};
        var contactsEl = stanza.getChild('contacts');
        if (contactsEl) {
          var phoneEls = contactsEl.getChildren('phone');
          for (var i = 0, length = phoneEls.length; i < length; i++) {
            var phoneEl = phoneEls[i];
            var number = phoneEl.attrs['number'];
            var type = phoneEl.attrs['type'];
            var phone = number;
            phones[type] = phone;
          }
        }
        callback(null, phones);
      });    
    },
    remaining: function() {
      var callback;
      var to;

      if (typeof arguments[0] === 'object') {
        callback = arguments[1];
        to = arguments[0].user;
      }
      else {
        callback = arguments[0];
        to = Y.jid.local;
      }

      var jid = getJID(to, services['energy']);
      var number = jid.local;

      var from = Y.jid.bare;
      var to = number ? new JID(number + '@' + Y.domain) : Y.jid.bare;

      var stanza = (
        '<iq type="get">' +
          '<energy xmlns="com.yuilop.energy#remaining"  from="' + from + '" to="' + to + '">' +
            '<voice/>' +
            '<sms/>' +
          '</energy>' +
        '</iq>'
      );
      send(jid, stanza, function(err, res) {
        if (err)
          return callback(true);

        var energyEl = res.getChild('energy');
        if (!energyEl)
          return callback(true);

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

        callback(null, remaining);
      });     
    },
    token: function() {
      var token;
      var callback;
      if (typeof arguments[0] === 'string') {
        token = arguments[0];
        callback = arguments[1];
      }
      else {
        callback = arguments[0];
      }

      //get
      if (!token) {
        var options = {
          method: 'GET',
          url: 'https://' + services['login'] + '/token'
        };
        request(options, function (err, res) {
          if (err)
            return callback(true);

          callback(null, res);
        });
      }
      //send
      else {
        var socket;

        var onMessage = function(e) {
          var message = JSON.parse(e.data);
          var result = message.result;
          if (!result)
            callback(message);
          else
            callback(null, result);

          close();
        };
        var close = function() {
          socket.removeEventListener('open', onOpen);
          socket.removeEventListener('close', onClose);
          socket.removeEventListener('error', onError);
          socket.removeEventListener('message', onMessage);
          socket.close();
        };
        var onClose = function() {
          socket.removeEventListener('open', onOpen);
          socket.removeEventListener('close', onClose);
          socket.removeEventListener('error', onError);
          socket.removeEventListener('message', onMessage);
          DEBUG('login tunnel closed');
          open();
        }
        var onOpen = function() {
          DEBUG('login tunnel opened');
          var request = {
            "jsonrpc": "2.0",
            "method": "token",
            "params": {
              "value": token,
            },
            "id": "1"
          };
          this.send(JSON.stringify(request));
        };
        var onError = function(e) {
          socket.removeEventListener('close', onClose);
          callback(true);
        };
        var open = function() {
          socket = new WebSocket('wss://' + services['happy']);
          socket.addEventListener('open', onOpen);
          socket.addEventListener('close', onClose);
          socket.addEventListener('error', onError);
          socket.addEventListener('message', onMessage);
        };
        open();
      }
    },
    storage: function(callback) {
      var req = {
        'method': 'get',
        'params': {
          'path': '/'
        }
      };
      this.sendRPC(req, function(res) {
        callback(res.error, res.result);
      });
    },
    avatar: function(data, callback) {
      var options = {
        auth: true,
        url: 'https://' + services['happy'] + '/storage/devices/' + data.device + '/contacts/' + data.contact + '/avatar',
        //workaround safari, no support for responseType blob :/
        responseType: 'arraybuffer'
      };

      this.request(options, function(err, result) {
        if (err)
          return callback(err);

        var contentType = this.getResponseHeader('Content-Type');
        var blob = new Blob([result], {type: contentType});

        callback(null, blob);
      })
    },
    upload: function(file, callback, onProgress) {
      if (!(file instanceof Blob) && !(file instanceof File))
        return callback(new Error('Wrong data type'));

      this.request({
        method: 'POST',
        url: 'https://' + services['happy'] + '/media',
        auth: true,
        post: file
      }, function(err, result) {
        if (err)
          return callback(err);

        callback(null, JSON.parse(result));
      }, onProgress);
    }
	};

  //
  //message helpers
  //
  var getStanzaPayloadForTextMessage = function(value) {
    var payload = (
      '<body>' + unesc(value) + '</body>'
    );
    return payload;
  };
  var getStanzaPayloadForLocationMessage = function(value) {
    var escapedURL = esc(value.url);
    var payload = (
      '<body>' + escapedURL + '</body>' +
      '<multimedia xmlns="com.yuilop.multimedia">' +
        '<location url="' + escapedURL + '" thumbnail="' + esc(value.thumbnail.url) + '"/>' +
      '</multimedia>' +
      '<geoloc xmlns="http://jabber.org/protocol/geoloc">' +
        '<lat>' + value.latitude + '</lat>' +
        '<lon>' + value.longitude + '</lon>' +
      '</geoloc>'
    );
    return payload;
  };
  var getStanzaPayloadForFileMessage = function(value) {
    var escapedURL = esc(value.url);
    var payload = (
      '<body>' + escapedURL + '</body>' +
      '<multimedia xmlns="com.yuilop.multimedia">' +
        '<file ' +
          'name="' + value.name + '" ' +
          'size="' + value.size + '" ' +
          'url="' + escapedURL + '" ' +
          (value.type ? 'type="' + value.type +  '" ' : ' ') +
          (value.thumbnail && value.thumbnail.url ? 'thumbnail="' + esc(value.thumbnail.url) +  '"' : '') +
        '/>' +
      '</multimedia>'
    );
    return payload;
  };

  var buildMessageStanza = function(message) {
    var id = Lightstring.id();
    var value = message.value;
    var payload;
    if (typeof value === 'string')
      payload = getStanzaPayloadForTextMessage(value);
    else if (value.multimedia === 'location')
      payload = getStanzaPayloadForLocationMessage(value);
    else if (value.multimedia === 'file')
      payload = getStanzaPayloadForFileMessage(value);

    var stanza = new Stanza(
      '<message id="' + id + '">' +
        payload +
        '<request xmlns="urn:xmpp:receipts"/>' +
        '<nick xmlns="http://jabber.org/protocol/nick">' + Y.username + '</nick>' +
      '</message>'
    );
    return stanza;
  };

})(Yuilop);


