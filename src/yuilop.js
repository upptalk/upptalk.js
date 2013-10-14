(function(window) {

'use strict';

var DEBUG = function(message) {
  if (Yuilop.debug)
    console.debug(message);
};
var ERROR = function(e) {
  console.error(e);
}

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
var cache; // Yuilop.cache

//json-rpc
var callbacks = {};

var lastActivity;

var lastActivity = null;
var timeout = null;
var pingInterval = 10000;
var pongTimeout = 2000;
var pongTimeoutFun = null;
var reconnectInterval = 2000;

var connecting = false;

var Yuilop = {
  JID: JID,
  cache: {},
  jid: null,
  login: null,
  password: null,
  connection: null,
  socket: null,
  config: {},
  services: {},
  getJID: function() {
    if (arguments[0] instanceof JID)
      return arguments[0]

    if (!arguments[1])
      return new JID(arguments[0]);

    return new JID(arguments[0] + '@' + arguments[1]);
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
  on: function(name, data) {
    this.eventEmitter.on(name, data);
  },
  event: function(name, data) {
    this.eventEmitter.emit('event', name, data);
    this.eventEmitter.emit(name, data);
  },
  sendRPC: function(request, callback) {
    this.enchufe.send(request, callback)
  },
  send: function() {
    var stanza;
    var callback;
    if (typeof arguments[1] === 'function' || arguments.length === 1) {
      stanza = new Stanza(arguments[0]);
      callback = arguments[1];
    }
    else {
      var jid = arguments[0].toString();
      stanza = new Stanza(arguments[1]);
      stanza.attrs.to = jid;
      callback = arguments[2];
    }

    Y.sendStanza(stanza, callback);
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
      options.username = Y.jid.bare;
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
    var jid = new JID(username);
    if (!jid.domain)
      jid.domain = Yuilop.domain;

    this.jid = jid;
    this.username = jid.local;
    this.password = password;
  },
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
  newActivity: function(timestamp) {
    if (!lastActivity || timeout || timestamp - lastActivity < pingInterval) {
      clearTimeout(timeout);
      timeout = setTimeout((function() {
        var received;
        pongTimeoutFun = setTimeout((function() {
          // this.connection.transport.socket.close();
          clearTimeout(timeout);
          timeout = null;
          lastActivity = null;
          conn.onClose();
        }).bind(this), pongTimeout);
        this.emit('ping', function() {
          clearTimeout(pongTimeoutFun);
        });
      }).bind(this), pingInterval);
    }
    lastActivity = timestamp;
  },
  connect: function(callback) {
    var done = 0;

    if (connecting)
      return;
    else
      connecting = true;

    //XMPP
    this.jid.resource = 'Webx1.0xx' + Lightstring.id() + 'x';
    this.connection = new L.Connection('wss://' + services['proxy']);
    conn = this.connection;
    var that = this;
    conn.onConnected = function() {
      that.newActivity(Date.now());
      DEBUG('XMPP authenticated');
      if (callback && ++done === 2)
        callback()
    };
    conn.onFailure = function(err) {
      callback(true);
    };
    conn.onStanza = function(stanza) {
      that.newActivity(Date.now());
      DEBUG('stanza in:')
      DEBUG(stanza.toString());
      Y.routeStanza(stanza);
    };
    conn.onOut = function(stanza) {
      DEBUG('stanza out:')
      DEBUG(stanza.toString());
    };
    conn.onClose = function() {
      clearTimeout(timeout);
      clearTimeout(pongTimeoutFun);
      timeout = null;
      lastActivity = null;
      connecting = false;
      if (Y.onDisconnected)
        Y.onDisconnected();
    };
    conn.onError = function(e) {
      ERROR(e);
    };
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
          callback();
      });
    }).bind(this));
    this.enchufe = enchufe;
  },
  reconnect: function() {
    this.connection.connect(this.jid, this.password);
  },
  disconnect: function() {
    this.emit('presence', {type: 'offline'});
    conn.disconnect();
  },
  /////////////
  //Groupchat//
  /////////////
  // isGroupchat: function(jid) {
  //   if (!(jid instanceof JID))
  //     jid = new JID(jid);

  //   return (jid.domain === conf['groupchat-service']) ? true : false;
  // },
  // createGroupchat: function(name, callback) {
  //   var uuid = function(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b};
  //   var jid = new JID();
  //   jid.local = uuid();
  //   jid.domain = conf['groupchat-service'];

  //   var id = L.id();
  //   var stanza = (
  //     //FIXME, why id here? it's a presence
  //     '<presence id="' + id + '" to="' + jid + '/' + Y.jid.local + '">' +
  //       '<x xmlns="http://jabber.org/protocol/muc"/>' +
  //     '</presence>'
  //   );
  //   send(stanza);
  //   //FIXME, listen for presence event to call callback
  //   callback();
  // },
  // setGroupchatName: function(groupchat, name) {
  //   var id = L.id();
  //   var stanza = (
  //     '<message id="' + id + '" to="' + groupchat + '" type="groupchat">' +
  //       '<subject>' + name + '</subject>' +
  //       '<request xmlns="urn:xmpp:receipts"/>' +
  //     '</message>'
  //   );
  //   send(stanza);
  //   //FIXME, listen for message receipt
  //   callback();
  // },
  // inviteToGroupchat: function(groupchat, user) {
  //   var stanza = (
  //     '<message to="' + groupchat + '">' +
  //       '<x xmlns="http://jabber.org/protocol/muc#user">' +
  //         '<invite to="' + user + '">' +
  //           '<reason/>' +
  //         '</invite>' +
  //       '</x>' +
  //     '</message>'
  //   );
  //   send(stanza);
  // },
  // kickFromGroupchat: function(groupchat, user, callback) {
  //   var stanza = (
  //     '<iq to="' + groupchat + '" type="set">' +
  //       '<query xmlns="http://jabber.org/protocol/muc#admin">' +
  //         '<item jid="' + user + '" role="none">' +
  //         '</item>' +
  //       '</query>' +
  //     '</iq>'
  //   );
  //   send(stanza, function(err, res) {
  //     if (err)
  //       return callback(true);

  //     callback();
  //   });
  // },
  ///////////
  //Profile//
  ///////////
  // getProfile: function(callback) {
  //   var jid = this.getJID(services['user-service']);
  //   var stanza = (
  //     '<iq type="get">' +
  //       '<profile xmlns="com.yuilop.profile"/>' +
  //     '</iq>'
  //   );
  //   send(jid, stanza, function(err, res) {
  //     if (err)
  //       return callback(true);

  //     var nicknameEl = res.getChild('profile').getChild('nickname');
  //     var nickname = nicknameEl.text();

  //     var profile = {
  //       nickname: nickname ? nickname : null
  //     };

  //     callback(null, profile)
  //   });
  // },
  // setProfile: function(profile, callback) {
  //   var jid = this.getJID(services['user-service']);
  //   var stanza = (
  //     '<iq type="set">' +
  //       '<profile xmlns="com.yuilop.profile">' +
  //         '<nickname>' +
  //           profile.nickname +
  //         '</nickname>' +
  //       '</profile>' +
  //     '</iq>'
  //   );
  //   send(jid, stanza, function(err, res) {
  //     if (err)
  //       return callback(true);

  //     callback();
  //   });
  // },
  ////////
  //Chat//
  ////////
  wasSentFromThisDevice: function(jid, messageid, type) {
    if (type === 'groupchat') {
      var hackId = jid + '/' + messageid;
      if (this.sentFromThisDeviceHack[hackId]) {
        delete this.sentFromThisDeviceHack[hackId];
        return true; 
      }
      else
        return false;
    }

    if (jid.equals(Y.jid))
      return true;

    return false;
  },
  sentFromThisDeviceHack: {},
  // sendGroupchatMessage: function(to, message) {
  //   var jid = this.getJID(groupchat, services['groupchat']);
  //   var stanza = this.buildMessageStanza(message);
  //   stanza.attrs.type = 'groupchat';

  //   send(jid, stanza);
  //   return stanza.attrs.id;
  // },
  // sendSMS: function(to, message) {
  //   var jid = this.getJID(to, services['sms']);
  //   var stanza = this.buildMessageStanza(message);
  //   stanza.attrs.type = 'chat';

  //   send(jid, stanza);
  //   return stanza.attrs.id;
  // },
  // sendChatMessage: function(to, message) {
  //   var jid = this.getJID(to, Y.domain);
  //   var stanza = this.buildMessageStanza(message);
  //   stanza.attrs.type = 'chat';

  //   send(jid, stanza);
  //   return stanza.attrs.id;
  // },
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

  // allowSubscription: function(to) {
  //   var stanza = (
  //     '<presence to="' + to + '" type="subscribed"/>'
  //   );
  //   send(stanza);
  // },
  // askForSubscription: function(to) {
  //   var stanza = (
  //     '<presence to="' + to + '" type="subscribe"/>'
  //   );
  //   send(stanza);
  // },
  // getContacts: function(callback) {
  //   Yuilop.modules.devices.getDevices(function(err, devices) {
  //     if (err)
  //       return callback(err);

  //     var contacts = [];
  //     for (var i in devices) {
  //       for (var y in devices[i].contacts) {
  //         devices[i].contacts[y].id = i + '/' + y;
  //         if (devices[i].contacts[y].avatar) {
  //           var splitted = Yuilop.config['api-server'].split('://');
  //           var protocol = splitted[0];
  //           var host = splitted[1];

  //           devices[i].contacts[y].avatar = (
  //             protocol + '://' +
  //             host + '/storage/devices/' + i + '/contacts/' + y + '/avatar'
  //           );
  //         }
  //         contacts.push(devices[i].contacts[y]);
  //       }
  //     }

  //     callback(null, contacts)
  //   });
  // },
  // getContactsFromRoster: function(ver, callback) {
  //   var stanza = (
  //     '<iq type="get">' +
  //       '<query xmlns="jabber:iq:roster"' +
  //         //http://xmpp.org/rfcs/rfc6121.html#roster-versioning
  //         (typeof aVer === 'string' ? ' ver="' + ver + '"' : '') +
  //       '/>' +
  //     '</iq>'
  //   );

  //   send(stanza, function(err, res) {
  //     if (err)
  //       return callback(err);

  //     var contacts = [];

  //     var query = stanza.getChild('query');
  //     if (!query)
  //       return aCallback(null, contacts);
  //     else
  //       var ver = stanza.getChild('query').attrs['ver'];

  //     var items = query.getChildren('item');
  //     for (var i = 0, length = items.length; i < length; i++) {
  //       var item = items[i];
  //       var contact = item.attrs;
  //       contacts.push(contact);
  //     }

  //     aCallback(null, contacts, ver);
  //   });
  // },
};

Yuilop.eventEmitter = new EventEmitter();

Yuilop.emit = function() {
  var args = Array.prototype.slice.call(arguments)
  args.shift('emit');

  this.eventEmitter.emit.apply(this.eventEmitter, args);

  var emitter = this.emitters[arguments[0]];
  if (!emitter)
    return;

  args.unshift();

  return emitter.apply(this, args);
};
Yuilop.emitters = {};

Y = Yuilop;
Y.Stanza = Stanza;
conf = Y.config;
send = Y.send;
username = Y.username;
password = Y.password;
services = Y.services;
request = Y.request;
cache = Y.cache;

window.Yuilop = Y;

})(window);