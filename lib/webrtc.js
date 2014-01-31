(function(global) {

  'use strict';

  var RTCPeerConnection = (
    window.RTCPeerConnection ||
    window.mozRTCPeerConnection ||
    window.webkitRTCPeerConnection
  );
  navigator.getUserMedia = (
    navigator.getUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.webkitGetUserMedia
  );
  var RTCSessionDescription = (
    window.RTCSessionDescription ||
    window.webkitRTCSessionDescription ||
    window.mozRTCSessionDescription
  );
  var RTCIceCandidate = (
    window.RTCIceCandidate ||
    window.webkitRTCIceCandidate ||
    window.mozRTCIceCandidate
  );

  var UppTalk = global.UppTalk;
  var EventEmitter = global.EventEmitter;

  if (
    !RTCPeerConnection ||
    !navigator.getUserMedia ||
    !RTCSessionDescription ||
    !RTCIceCandidate
  )
    return;

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


  var Call = function(client, user) {
    debug('new call instance');
    this.id = Math.random().toString();
    this.user = user;
    this.client = client;
    EventEmitter.call(this);
  };
  Call.prototype = EventEmitter.prototype;
  Call.prototype.init = function(callback) {
    debug('init');
    var call = this;

    var configuration = {
      "iceServers": [
        {
          url: call.client.turn.url,
          username: call.client.turn.username,
          credential: call.client.turn.credential
        }
      ]
    };

    console.log('PeerConnection configuration', configuration);

    var pc = new RTCPeerConnection(configuration, options);
    this.peerConnection = pc;

    pc.onicecandidate = function(evt) {
      debug('send ice candidate');
      call.send({candidate: evt.candidate});
    };
    pc.onaddstream = function(evt) {
      debug('remote stream');
      call.emit('remotestream', evt.stream);
    };

    if (this.localstream) {
      debug('got local stream');
      pc.addStream(this.localstream);
      if (callback)
        callback();
    }
    else {
      navigator.getUserMedia({video: true, audio: true},
        //success
        function (stream) {
          debug('got local stream');
          call.emit('localstream', stream);
          pc.addStream(stream);
          if (callback)
            callback();
        },
        //error
        function(err) {
          call.emit('error', err);
        }
      );
    }
  };
  Call.prototype.accept = function(stream) {
    debug('accept');
    if (stream)
      this.localstream = stream;

    var call = this;

    this.init(function() {
      call.send({type: 'accept'});
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
    delete this.client.calls[this.id];
  };
  Call.prototype.offer = function() {
    debug('offer');
    this.send({type: 'offer'});
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
  Call.prototype.onaccept = function() {
    debug('on accept');
    this.emit('accept');

    var call = this;

    this.init(function() {
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
    });
  };
  Call.prototype.onreject = function() {
    debug('on reject');
    this.emit('reject');
    delete this.client.calls[this.id];
  };
  Call.prototype.onhangup = function() {
    debug('on hangup');
    this.emit('hangup');
    delete this.client.calls[this.id];
  };


  UppTalk.prototype.handleWebRTCPacket = function(p) {
    if (typeof p.user !== 'string' || typeof p.id !== 'string')
      return;

    this.calls = this.calls || {};

    var call = this.calls[p.id];

    //a new call offer is received
    if (!call && p.type === 'offer') {
      call = new Call(this, p.user);
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
      call.onaccept();
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
  UppTalk.prototype.call = function(username, stream) {
    debug('call');
    var call = new Call(this, username);
    if (stream)
      call.localstream = stream;
    this.calls = this.calls || {};
    this.calls[call.id] = call;
    call.offer();
    return call;
  };

})(this);