(function(window) {

'use strict';

var DEBUG = function(message) {
  console.log('yuilop.js ' + message)
};

var L = window.Lightstring;
var JID = L.JID;
var Stanza = L.Stanza;
var esc = L.escape;
var unesc = L.unescape;

var Y; //Yuilop
var conn; //Yuilop.connection
var conf; //Yuilop.config
var send; //Yuilop.send
var req;  //Yuilop.requet
var jid; //Yuilp.jid
var username; //Yuilop.username
var password; //Yuilop.password
var services; //Yuilop.services
var request; //Yuilop.request

//json-rpc
var callbacks = {};

var Yuilop = {
  jid: null,
  login: null,
  password: null,
  connection: null,
  socket: null,
  config: {},
  services: {},
  events: {
    receipt: function() {},
    chatstate: function() {},
    groupchat: function() {},
    message: function() {},
    presence: function() {}
  },
  sendStanza: function(stanza, callback) {
    if (!callback)
      return this.connection.send(stanza);

    conn.send(stanza,
      //success
      function(stanza) {
        callback(null, stanza);
      },
      //error
      function(stanza) {
        callback(stanza);
      }
    );
  },
  sendRPC: function(request, callback) {
    this.enchufe.send(request, callback)
  },
  send: function(message, callback) {
    if (typeof message === 'string' || message instanceof Stanza)
      Y.sendStanza(message, callback);
    else
      Y.sendRPC(message, callback);
  },
  request: function(options, callback, onProgress) {
    var req = new XMLHttpRequest();
    req.addEventListener("error", function(e) {
      return callback.call(req, e, null);
    });
    req.addEventListener("abort", function(e) {
      return callback.call(req, e, null);
    });
    req.addEventListener('load', function() {
      if ((this.status !== 200) && (this.status !== 201))
        return callback.call(req, this.status, null);

      return callback.call(req, null, this.response);
    });
    if (onProgress) {
      req.upload.addEventListener('progress', function(e) {
        if (!e.lengthComputable)
          return;

       var percentComplete = e.loaded / e.total;
       onProgress(percentComplete);
      });
    }

    req.open(options.method || 'GET', options.url, true);

    if (options.auth === true) {
      options.username = Y.username;
      options.password = Y.password; 
    }

    if (options.username && options.password) {
      var creds = options.username + ':' + options.password;
      req.setRequestHeader('Authorization', 'Basic ' + btoa(creds));
    }
    if (options.responseType)
      req.responseType = options.responseType;

    for (var i in options.headers) {
      req.setRequestHeader(i, options.headers[i]);
    }

    req.send(options.post || null);
  },
  setCredentials: function(username, password) {
    this.jid = new JID(username);
    jid = this.jid;
    if (!jid.domain)
      jid.domain = Yuilop.domain;

    this.jid = jid;
    this.username = jid.local;
    this.password = password;
  },
  ////////////
  //presence//
  ////////////
  sendPresence: function() {
    send('<presence/>');
  },
  //////////////
  //connection//
  //////////////
  generateLoginBarcode: function(token) {
    var data = document.location.protocol + '//' + document.location.host + '/barcode.xhml?token=' + token;
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
  connect: function(callback) {
    var done = 0;

    //XMPP
    this.jid.resource = 'Webx1.0xx' + Lightstring.id() + 'x';
    this.connection = new L.Connection('wss://' + services['proxy']);
    conn = this.connection;
    conn.onOpen = function() {
      DEBUG('XMPP open');
    };
    conn.onConnected = function() {
      DEBUG('XMPP authenticated');
      if (callback && ++done === 2)
        callback();
    };
    conn.onFailure = function(err) {
      callback(true)
    };
    conn.onStanza = Y.routeStanza;
    conn.connect(this.jid, this.password);

    //JSON-RPC
    var enchufe = new Enchufe('wss://' + services['happy']);
    enchufe.open((function(err) {
      if (err)
        return callback(err);

      DEBUG('JSON-RPC open')

      enchufe.authenticate(this.jid.bare, this.password, function(err) {
        if (err)
          return callback(err);

        DEBUG('JSON-RPC authenticated')
        if (callback && ++done === 2)
          callback()
      });
    }).bind(this));
    this.enchufe = enchufe;
  },
  reconnect: function() {
    this.connection.connect(this.jid, this.password);
  },
  disconnect: function() {
    send('<presence type="unavailable"/>');
    conn.disconnect();
  },
  getLoginToken: function(callback) {
    var options = {
      method: 'GET',
      url: 'https://' + services['login'] + '/token'
    };
    request(options, function (err, res) {
      if (err)
        return callback(true);

      callback(null, res);
    });
  },
  sendLoginToken: function(token, callback) {
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
  },
  /////////////
  //Groupchat//
  /////////////
  isGroupchat: function(jid) {
    if (!(jid instanceof JID))
      jid = new JID(jid);

    return (jid.domain === conf['groupchat-service']) ? true : false;
  },
  createGroupchat: function(name, callback) {
    var uuid = function(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b};
    var jid = new JID();
    jid.local = uuid();
    jid.domain = conf['groupchat-service'];

    var id = L.id();
    var stanza = (
      //FIXME, why id here? it's a presence
      '<presence id="' + id + '" to="' + jid + '/' + Y.jid.local + '">' +
        '<x xmlns="http://jabber.org/protocol/muc"/>' +
      '</presence>'
    );
    send(stanza);
    //FIXME, listen for presence event to call callback
    callback();
  },
  setGroupchatName: function(groupchat, name) {
    var id = L.id();
    var stanza = (
      '<message id="' + id + '" to="' + groupchat + '" type="groupchat">' +
        '<subject>' + name + '</subject>' +
        '<request xmlns="urn:xmpp:receipts"/>' +
      '</message>'
    );
    send(stanza);
    //FIXME, listen for message receipt
    callback();
  },
  getGroupchatParticipants: function(groupchat, callback) {
    var stanza = (
      '<iq to="' + groupchat + '" type="get">' +
        '<query xmlns="http://jabber.org/protocol/muc#admin"/>' +
      '</iq>'
    );
    send(groupchat, function(err, res) {
      if (err)
        return callback(true);

      var queryEl = res.getChild('query');
      var itemsEl = queryEl.getChildren('item');
      var participants = [];
      for (var i = 0, length = itemsEl.length; i < length; i++) {
        participants.push({
          jid: new JID(itemsEl[i].attrs.jid),
          name: itemsEl[i].attrs.nick || this.jid.local,
          affiliation: itemsEl[i].attrs.affiliation,
          role: itemsEl[i].attrs.role,
        });
      }

      callback(null, participants)
    });
  },
  leaveGroupchat: function(to, callback) {
    var stanza = (
      '<presence to="' + to + '" type="unavailable"/>'
    );
    send(stanza);
    //FIXME, listen for presence event to call callback
    callback();
  },
  inviteToGroupchat: function(groupchat, user) {
    var stanza = (
      '<message to="' + groupchat + '">' +
        '<x xmlns="http://jabber.org/protocol/muc#user">' +
          '<invite to="' + user + '">' +
            '<reason/>' +
          '</invite>' +
        '</x>' +
      '</message>'
    );
    send(stanza);
  },
  kickFromGroupchat: function(groupchat, user, callback) {
    var stanza = (
      '<iq to="' + groupchat + '" type="set">' +
        '<query xmlns="http://jabber.org/protocol/muc#admin">' +
          '<item jid="' + user + '" role="none">' +
          '</item>' +
        '</query>' +
      '</iq>'
    );
    send(stanza, function(err, res) {
      if (err)
        return callback(true);

      callback();
    });
  },
  getGroupchats: function(callback) {
    var stanza = (
      '<iq to="' + conf['groupchat-service'] + '" type="get">' +
        '<query xmlns="http://jabber.org/protocol/disco#items"/>' +
      '</iq>'
    );
    send(stanza, function(err, res) {
      if (err)
        return callback(true);

      var queryEl = result.getChild('query');
      var itemsEl = queryEl.getChildren('item');
      var groupchats = [];
      for (var i = 0, length = itemsEl.length; i < length; i++) {
        groupchats.push({
          jid: new JID(itemsEl[i].attrs.jid),
          name: itemsEl[i].attrs.name,
        });
      }
      callback(null, groupchats);
    });
  },
  ///////////
  //Profile//
  ///////////
  getProfile: function(callback) {
    var stanza = (
      '<iq type="get" to="' + conf['user-service'] + '">' +
        '<profile xmlns="com.yuilop.profile"/>' +
      '</iq>'
    );
    send(stanza, function(err, res) {
      if (err)
        return callback(true);

      var nicknameEl = res.getChild('profile').getChild('nickname');
      var nickname = nicknameEl.text();

      var profile = {
        nickname: nickname ? nickname : null
      };

      callback(null, profile)
    });
  },
  setProfile: function(profile, callback) {
    var stanza = (
      '<iq type="set" to="' + conf['user-service']+ '">' +
        '<profile xmlns="com.yuilop.profile">' +
          '<nickname>' +
            profile.nickname +
          '</nickname>' +
        '</profile>' +
      '</iq>'
    );
    send(stanza, function(err, res) {
      if (err)
        return callback(true);

      callback();
    });
  },
  ////////
  //Chat//
  ////////
  sendDeliveryReceipt: function(to, id, type) {
    var stanza = (
       '<message to="' + to + '" type="chat">' +
         '<' + type + ' xmlns="urn:xmpp:receipts" id="' + id + '"/>' +
       '</message>'
     );
    send(stanza);
  },
  sendChatState: function(to, state) {
    var stanza = (
      '<message to="' + to + '" type="chat">' +
        '<' + state + ' xmlns="http://jabber.org/protocol/chatstates"/>' +
      '</message>'
    );
    send(stanza);
  },
  sendChatMessage: function(to, message) {
    if (!message.id)
      message.id = L.id();

    var type = this.isGroupchat(to) === true ? 'groupchat' : 'chat';

    var payload;
    if (message.file)
      payload = this.getStanzaPayloadForFileMessage(message);
    else if (message.location)
      payload = this.getStanzaPayloadForLocationMessage(message);
    else
      payload = this.getStanzaPayloadForTextMessage(message);

    var stanza = (
      '<message to="' + to + '" id="' + message.id + '" type="' + type + '">' +
        payload +
        '<request xmlns="urn:xmpp:receipts"/>' +
        '<nick xmlns="http://jabber.org/protocol/nick">' + Y.username + '</nick>' +
      '</message>'
    );

    send(stanza);
    return message.id
  },
  getStanzaPayloadForTextMessage: function(message) {
    var payload = (
      '<body>' + unesc(message.body) + '</body>'
    );
    return payload;
  },
  getStanzaPayloadForLocationMessage: function(message) {
    var escapedURL = esc(message.location.url);
    var payload = (
      '<body>' + escapedURL + '</body>' +
      '<multimedia xmlns="com.yuilop.multimedia">' +
        '<location url="' + escapedURL + '" thumbnail="' + esc(message.location.thumbnail) + '"/>' +
      '</multimedia>' +
      '<geoloc xmlns="http://jabber.org/protocol/geoloc">' +
        '<lat>' + message.location.latitude + '</lat>' +
        '<lon>' + message.location.longitude + '</lon>' +
      '</geoloc>'
    );
    return payload;
  },
  getStanzaPayloadForFileMessage: function(message) {
    var escapedURL = esc(message.file.url);
    var payload = (
      '<body>' + escapedURL + '</body>' +
      '<multimedia xmlns="com.yuilop.multimedia">' +
        '<file ' +
          'name="' + message.file.name + '" ' +
          'size="' + message.file.size + '" ' +
          'url="' + escapedURL + '" ' +
          (message.file.type ? 'type="' + message.file.type +  '" ' : ' ') +
          (message.file.thumbnail && message.file.thumbnail ? 'thumbnail="' + esc(message.file.thumbnail.url) +  '"' : '') +
        '/>' +
      '</multimedia>'
    );
    return payload;
  },
  /////////
  //Cloud//
  /////////
  // getStorage: function(callback) {
  //   var options = {
  //     method: 'GET',
  //     url: conf['api-server'] + '/storage',
  //     login: Yuilop.jid,
  //     password: Yuilop.password,
  //   };

  //   request(options, function(err, result) {
  //     if (err)
  //       return callback(true);

  //     var result = JSON.parse(result);
  //     callback(null, result);
  //   });
  // },
  // deleteDevice: function(deviceID, callback) {
  //   var options = {
  //     method: 'DELETE',
  //     url: Yuilop.config['api-server'] + '/storage/devices/' + aId,
  //     login: Y.jid,
  //     password: Y.password
  //   };
  //   request(options, function(err) {
  //     if (err)
  //       return callback(true);

  //     callback();
  //   });
  // },
  ////////////
  //Contacts//
  ////////////
  getPhones: function(number, callback) {
    var to = new JID();
    to.local = number;
    to.domain = services['user'];
    var iq = (
      '<iq type="get" to="' + to + '">' +
        '<contacts xmlns="com.yuilop.contact"/>' +
      '</iq>'
    );
    send(iq, function(err, stanza) {
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
  getLastActivity: function(to, callback) {
    var stanza = (
      '<iq type="get" to="' + to + '">' +
        '<query xmlns="jabber:iq:last"/>' +
      '</iq>'
    );
    send(stanza, function(err, res) {
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
  allowSubscription: function(to) {
    var stanza = (
      '<presence to="' + to + '" type="subscribed"/>'
    );
    send(stanza);
  },
  askForSubscription: function(to) {
    var stanza = (
      '<presence to="' + to + '" type="subscribe"/>'
    );
    send(stanza);
  },
  showAsOnline: function() {
    var stanza = (
      '<presence/>'
    );
    send(stanza);
  },
  getContacts: function(callback) {
    Yuilop.modules.devices.getDevices(function(err, devices) {
      if (err)
        return callback(err);

      var contacts = [];
      for (var i in devices) {
        for (var y in devices[i].contacts) {
          devices[i].contacts[y].id = i + '/' + y;
          if (devices[i].contacts[y].avatar) {
            var splitted = Yuilop.config['api-server'].split('://');
            var protocol = splitted[0];
            var host = splitted[1];

            devices[i].contacts[y].avatar = (
              protocol + '://' +
              host + '/storage/devices/' + i + '/contacts/' + y + '/avatar'
            );
          }
          contacts.push(devices[i].contacts[y]);
        }
      }

      callback(null, contacts)
    });
  },
  getContactsFromRoster: function(ver, callback) {
    var stanza = (
      '<iq type="get">' +
        '<query xmlns="jabber:iq:roster"' +
          //http://xmpp.org/rfcs/rfc6121.html#roster-versioning
          (typeof aVer === 'string' ? ' ver="' + ver + '"' : '') +
        '/>' +
      '</iq>'
    );

    send(stanza, function(err, res) {
      if (err)
        return callback(err);

      var contacts = [];

      var query = stanza.getChild('query');
      if (!query)
        return aCallback(null, contacts);
      else
        var ver = stanza.getChild('query').attrs['ver'];

      var items = query.getChildren('item');
      for (var i = 0, length = items.length; i < length; i++) {
        var item = items[i];
        var contact = item.attrs;
        contacts.push(contact);
      }

      aCallback(null, contacts, ver);
    });
  },
  getStorage: function(callback) {
    var req = {
      'method': 'get',
      'params': {
        'path': '/'
      }
    };
    send(req, function(res) {
      callback(res.error, res.result);
    })
  },
  //////////////
  //Multimedia//
  //////////////
  uploadFile: function(file, callback, onProgress) {
    if (!(file instanceof Blob) || !(file instanceof File))
      return callback(true);

    this.request({
      method: 'POST',
      url: conf['media-server'] + '/media',
      login: login,
      password: password,
      post: body
    }, function(err, result) {
      if (err)
        callback(true);
      else
        callback(null, JSON.parse(result));
    }, onProgress);
  },
  getAvatar: function(device, contact, callback) {
    var options = {
      auth: true,
      url: 'https://' + Yuilop.services['happy'] + '/storage/devices/' + device + '/contacts/' + contact + '/avatar',
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
  //////////
  //Energy//
  //////////
  getEnergyLeft: function(callback) {
    var stanza = (
      '<iq to="' + services['energy'] + '" type="get">' +
        '<energy xmlns="com.yuilop.energy"/>' +
      '</iq>'
    );
    send(stanza, function(err, res) {
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
  getEnergyCosts: function(number, callback) {
    var from = conn.jid.bare;
    var to = number ? new JID(number + '@' + conf.domain) : jid.bare;
    var stanza = (
      '<iq to="' + services['energy'] + '" type="get">' +
        '<energy xmlns="com.yuilop.energy#remaining"  from="' + from + '" to="' + to + '">' +
          '<voice/>' +
          '<sms/>' +
        '</energy>' +
      '</iq>'
    );
    send(stanza, function(err, res) {
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
};

Y = Yuilop;
conf = Y.config;
send = Y.send;
username = Y.username;
password = Y.password;
services = Y.services;
request = Y.request;

window.Yuilop = Y;

})(window);