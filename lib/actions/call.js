/*
 * WebRTC
 */

(function(global) {

  'use strict';

  //iterate over an array until fn returns a trully value but
  //doesn't convert value contrary to Array.prototype.some
  var just4fun = function(fn) {
    for (var i = 0, l = this.length; i < l; i++) {
      var k = fn(this[i]);
      if (k)
        return k;
    }
  };

  var getUserMediaPrefix = just4fun.call([
    'getUserMedia',
    'mozGetUserMedia',
    'webkitGetUserMedia'
  ], function(p) {
      return global.navigator[p] ? p : false;
  });

  //  var getUserMedia = navigator.getUserMedia;
  //or
  //  var getUserMedia = navigator.getUserMedia.bind(navigator);
  //then
  //  getUserMedia();
  //fails on
  //  Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0)
  //  AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.152 Safari/537.36
  var getUserMedia = getUserMediaPrefix ? function() {
    return global.navigator[getUserMediaPrefix];
  } : null;

  var RTCPeerConnection = (
    global.RTCPeerConnection ||
    global.mozRTCPeerConnection ||
    global.webkitRTCPeerConnection
  );

  var RTCSessionDescription = (
    global.RTCSessionDescription ||
    global.webkitRTCSessionDescription ||
    global.mozRTCSessionDescription
  );

  var RTCIceCandidate = (
    global.RTCIceCandidate ||
    global.webkitRTCIceCandidate ||
    global.mozRTCIceCandidate
  );

  var UppTalk = global.UppTalk;
  var EventEmitter = global.EventEmitter;

  // var configuration = {
  //   "iceServers": [
  //     // {
  //     //   "url": "stun:stun.services.mozilla.com"
  //     // },
  //     // {
  //     //   "url": "stun:stun.ym.ms"
  //     // },
  //     {
  //       url: global.config.turn.url,
  //       username: global.config.turn.username,
  //       credential: global.config.turn.credential
  //     }
  //     //sturn
  //     // {
  //     //   "url": "stun:stun.ym.ms"
  //     // },
  //     //turn udp
  //     // {
  //     //   'url': 'turn:dev.ym.ms:3478?transport=udp',
  //     //   "username": "sonny",
  //     //   "credential": "foobar"
  //     // },
  //     //turn tcp
  //     // {
  //     //   'url': 'turn:turn:dev.ym.ms:3478?transport=tcp',
  //     //   "username": "sonny",
  //     //   "credential": "foobar"
  //     // }
  //   ]
  // };
  var options = {
    optional: [
      {DtlsSrtpKeyAgreement: true}, //required to interop Firefox and Chrome
      {RtpDataChannels: true} //enable DataChannels API on Firefox.
    ]
  };

  var debug = function() {
    // return;
    console.debug.call(console, arguments);
  };


  var Call = function(client, p) {
    debug('new call instance');
    this.id = Math.random().toString();
    this.user = p.user;
    this.client = client;
    this.remote = {
      video: false,
      audio: false,
      stream: null
    };
    this.local = {
      video: false,
      audio: false,
      stream: null
    };

    if (p.type === 'offer') {
      this.remote.video = p.video === true;
      this.remote.audio = p.audio === true;
    }
    else {
      this.local.video = p.video === true;
      this.local.audio = p.audio === true;
    }

    EventEmitter.call(this);
  };
  Call.prototype = EventEmitter.prototype;
  Call.prototype.getLocalMedia = function(fn) {
    if (this.local.stream) {
      this.local.audio = this.local.stream.getAudioTracks().length > 0;
      this.local.video = this.local.stream.getVideoTracks().length > 0;
      fn();
    }
    else {
      var call = this;
      getUserMedia({
          audio: this.local.audio,
          video: this.local.video
        },
        //success
        function (stream) {
          call.local.audio = stream.getAudioTracks().length > 0;
          call.local.video = stream.getVideoTracks().length > 0;
          call.local.stream = stream;
          call.emit('localstream', stream);
          call.emit('local', call.local);
          fn();
        },
        //error
        function(err) {
          fn(err);
        }
      );
    }
  };
  Call.prototype.init = function() {
    debug('init');
    var call = this;

    var configuration = {
      "iceServers": [
          // url: call.client.turn.url,
          // username: call.client.turn.username,
          // credential: call.client.turn.credential
      ]
    };

    if (call.client.turn)
      configuration.iceServers.push(call.client.turn);

    debug('PeerConnection configuration', configuration);

    var pc = new RTCPeerConnection(configuration, options);
    this.peerConnection = pc;

    pc.oniceconnectionstatechange = function() {
      var iceState = pc.iceConnectionState || pc.iceState;
      debug('ice connection state', iceState);


      if (iceState === 'disconnected' || iceState === 'closed') {
        call.onhangup();
      }
    };
    pc.onsignalingstatechange = function() {
      debug('signal state', pc.signalingState);
    };

    pc.onicecandidate = function(evt) {
      debug('send ice candidate');
      call.send({candidate: evt.candidate});
    };
    pc.onaddstream = function(evt) {
      call.remote.audio = evt.stream.getAudioTracks().length > 0;
      call.remote.video = evt.stream.getVideoTracks().length > 0;
      call.remote.stream = evt.stream;
      debug('remote stream');
      call.emit('remote', call.remote);
      call.emit('remotestream', evt.stream);
    };
    pc.addStream(this.local.stream);
  };
  Call.prototype.accept = function(opt) {
    opt = opt || {};
    debug('accept');

    this.local.video = typeof opt.video === 'boolean' ? opt.video : this.remote.video;
    this.local.audio = typeof opt.audio === 'boolean' ? opt.audio : this.remote.audio;

    var call = this;

    this.getLocalMedia(function(err) {
      if (err)
        return call.emit('error', err);

      call.init();
      call.send({type: 'accept', audio: call.local.audio, video: call.local.video});
    });
  };
  Call.prototype.reject = function() {
    debug('reject');
    this.send({type: 'reject'});
    delete this.client.calls[this.id];
  };
  Call.prototype.hangup = function() {
    debug('hangup');
    this.send({type: 'hangup'});

    if (this.PeerConnection)
      this.PeerConnection.close();

    delete this.client.calls[this.id];
  };
  Call.prototype.offer = function() {
    debug('offer');
    console.log(this)
    this.send({type: 'offer', audio: this.local.audio, video: this.local.video});
  };
  Call.prototype.oncandidate = function(candidate) {
    debug('receive ice candidate');
    var RIC = new RTCIceCandidate(candidate);
    this.peerConnection.addIceCandidate(RIC);
  };
  Call.prototype.onlocaldescription = function(desc) {
    debug('local sdp');
    this.peerConnection.setLocalDescription(desc);
    this.send({sdp: desc});
  };
  Call.prototype.onremotedescription = function(desc) {
    debug('remote sdp');
    this.peerConnection.setRemoteDescription(new RTCSessionDescription(desc));
    var call = this;
    this.peerConnection.createAnswer(
      //success
      function(desc) {
        call.onlocaldescription(desc);
      },
      //error required by firefox 26
      function(err) {
        call.emit('error', err);
      }
    );
  };
  Call.prototype.send = function(m) {
    m.id = this.id;
    m.user = this.user;
    this.client.send('webrtc', m);
  };
  Call.prototype.onaccept = function(p) {
    debug('on accept');
    this.emit('accept', {video: p.video, audio: p.audio});

    if (typeof p.video === 'boolean')
      this.remote.video = p.video;
    if (typeof p.audio === 'boolean')
      this.remote.audio = p.audio;

    var call = this;

    this.init();
    call.peerConnection.createOffer(
      //success
      function(desc) {
        call.onlocaldescription(desc);
      },
      //error required by firefox 26
      function(err) {
        call.emit('error', err);
      }
    );
  };
  Call.prototype.onreject = function() {
    debug('on reject');

    this.emit('reject');

    delete this.client.calls[this.id];
  };
  Call.prototype.onhangup = function() {
    debug('on hangup');

    this.emit('hangup');

    if (this.peerConnection)
      this.peerConnection.close();

    delete this.client.calls[this.id];
  };
  Call.prototype.handleOptions = function(opt) {
    opt = opt || {};
    var options = {
      audio: opt.audio === true,
      video: opt.video === true,
    };

    //FIXME, there must be a better way to check if it's a Stream
    if (opt.stop)
      this.localstream = opt;
    else
      this.options = options;
  };
  UppTalk.prototype.Call = Call;

  UppTalk.prototype.handleWebRTCPacket = function(p) {
    if (typeof p.user !== 'string' || typeof p.id !== 'string')
      return;

    this.calls = this.calls || {};

    var call = this.calls[p.id];

    //a new call offer is received
    if (!call && p.type === 'offer') {
      call = new Call(this, p);
      call.id = p.id;
      this.calls[call.id] = call;
      this.emit('call', call);
    }

    //this call doesn't exist, offer is required first
    if (!call)
      return;

    //spoof
    if (call.user !== p.user)
      return;

    if (p.type === 'accept') {
      call.onaccept(p);
    }
    else if (p.type === 'reject') {
      call.onreject();
    }
    else if (p.type === 'hangup') {
      call.onhangup();
    }
    //sdp info
    else if (p.sdp) {
      call.onremotedescription(p.sdp);
    }
    //candidate info
    else if (p.candidate) {
      call.oncandidate(p.candidate);
    }
  };

  var bind;

  // WebRTC is supported
  if (RTCPeerConnection && getUserMedia && RTCSessionDescription && RTCIceCandidate) {
    bind = function(o) {
      var p = o.payload;
      var fn = o.callback;

      debug('call');
      var call = new Call(this, p);

      // call.handleOptions(p);

      this.calls = this.calls || {};
      this.calls[call.id] = call;

      fn(null, call);

      call.getLocalMedia(function(err) {
        if (err)
          return call.emit('error', err);

        call.offer();
      });
    };
  }
  // WebRTC is not supported
  else {
    bind = function(o) {
      var err = new Error('WebRTC not supported');
      err.code = 'FEATURE_NOT_AVAILABLE';
      if (!o.callback)
        throw err;

      o.callback(err);
    };
  }

  var action = {
    method: 'call',
    bind: bind
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = action;
  else
    global.UppTalk.actions[action.method] = action.bind;

})(this);