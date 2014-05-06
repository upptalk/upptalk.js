(function(global) {

  'use strict';

  var config = global.config;

  var client;
  var localVideo;
  var remoteVideo;
  var statusEl;
  var callEl;

  //handle in and out calls
  var handleCall = function(call) {

    var localStream;
    var remoteStream;

    call.once('local', function(local) {
      localStream = local.stream;
      localVideo.src = URL.createObjectURL(local.stream);
    });
    call.once('remote', function(remote) {
      remoteStream = remote.stream;
      remoteVideo.src = URL.createObjectURL(remote.stream);
    });
    call.once('error', function(err) {
      statusEl.textContent = 'ERROR';
      console.log(err);
    });
    call.once('accept', function() {
      statusEl.textContent = 'ACCEPTED';
    });
    call.once('reject', function() {
      statusEl.textContent = 'REJECTED';
    });
    call.once('hangup', function() {
      statusEl.textContent = 'HANGED UP';

      if (remoteStream)
        remoteStream.stop();
      if (localStream)
        localStream.stop();

      if (localVideo && localVideo.src) {
        URL.revokeObjectURL(localVideo.src);
        localVideo.src = '';
      }
      if (remoteVideo && remoteVideo.src) {
        URL.revokeObjectURL(remoteVideo.src);
        remoteVideo.src = '';
      }

    });
  };

  document.addEventListener('DOMContentLoaded', function() {
    var loginForm = document.getElementById('login');
    var callForm = document.getElementById('call');
    statusEl = document.getElementById('status');
    localVideo = document.getElementById('local');
    remoteVideo = document.getElementById('remote');
    callEl = callForm.querySelector('input[type="submit"]');
    //CALL
    callForm.addEventListener('submit', function(e) {
      e.preventDefault();

      statusEl.textContent = 'CALLING';

      var user = this.elements.username.value;
      var wanted = this.elements.stream.value;

      var p = {
        user: user
      };
      if (wanted === 'audio' || wanted === 'both')
        p.audio = true;
      if (wanted === 'video' || wanted === 'both')
        p.video = true;

      // navigator.getUserMedia({video: true, audio: true},
        //success
        // function (stream) {
      client.exec('call', p, function(err, call) {
        if (err)
          throw err;

        handleCall(call);
      });
          // localVideo.src = URL.createObjectURL(stream);


        // },
        // //error
        // function(err) {
        //   console.error(err);
        //   global.alert('error');
        // }
      // );
    });
    //LOGIN
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();

      statusEl.textContent = 'OPENING';
      var password = this.elements['password'].value;
      var username = this.elements['username'].value;

      client = new global.UppTalk(config);
      client.username = username;
      client.password = password;
      client.open(function(err) {
        if (err) {
          console.log(err);
          statusEl.textContent = 'ERROR';
          return;
        }

        statusEl.textContent = 'OPEN';

        client.exec('authenticate', {username: username, password: password}, function(err) {
          if (err) {
            console.log(err);
            statusEl.textContent = 'AUTHENTICATION FAILED';
            callEl.disabled = false;
            return;
          }

          client.exec('presence');

          callEl.disabled = false;

          statusEl.textContent = 'AUTHENTICATED';
        });
      });
      client.on('open', function() {
        console.log('OPEN');
      });
      client.on('message', function(m) {
        console.log('IN', m);
      });
      client.on('send', function(m) {
        console.log('OUT', m);
      });
      client.once('close', function() {
        console.log('CLOSE');
        statusEl.textContent = 'CLOSED';
      });
      client.on('error', function(err) {
        console.log('ERROR', err);
        statusEl.textContent = 'ERROR';
        callEl.disabled = false;
      });
      client.on('call', function(call) {

        console.log(call.user + ' is calling');
        statusEl.textContent = 'RINGING';

        // navigator.getUserMedia({video: true, audio: true},
          //success
          // function (stream) {
            // localVideo.src = URL.createObjectURL(stream);
            // call.accept(stream);
        call.accept();
        // call.accept({audio: true, video: true});
        handleCall(call);
          // },
          //error
        //   function(err) {
        //     console.error(err);
        //     global.alert('error');
        //   }
        // );

      });
    });
  });
})(this);
