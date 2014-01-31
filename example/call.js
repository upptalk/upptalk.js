(function(global) {

  'use strict';

  var client;
  var localVideo;
  var remoteVideo;
  var user;
  var statusEl;
  var config = global.config;

  document.addEventListener('DOMContentLoaded', function() {
    var loginForm = document.getElementById('login');
    var callForm = document.getElementById('call');
    statusEl = document.getElementById('status');
    localVideo = document.getElementById('local');
    remoteVideo = document.getElementById('remote');
    //CALL
    callForm.addEventListener('submit', function(e) {
      e.preventDefault();

      statusEl.textContent = 'CALLING';

      user = this.elements['username'].value;

      // navigator.getUserMedia({video: true, audio: true},
        //success
        // function (stream) {
      var call = client.call(user);
          // localVideo.src = URL.createObjectURL(stream);

      call.once('localstream', function(stream) {
        localVideo.src = URL.createObjectURL(stream);
      });
      call.once('remotestream', function(stream) {
        remoteVideo.src = URL.createObjectURL(stream);
      });
      call.on('error', function(err) {
        console.log(err);
      });
      call.on('accept', function() {
        console.log('call accepted');
      });
      call.on('reject', function() {
        console.log('call rejected');
      });
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

      client = new global.UppTalk({apikey: 'foobar', host: 'happy.dev.ym.ms', turn: config.turn});
      client.username = username;
      client.password = password;
      client.open(function(err) {
        if (err) {
          console.log(err);
          statusEl.textContent = 'ERROR';
          return;
        }

        statusEl.textContent = 'OPEN';

        this.send('authenticate', {username: this.username, password: this.password}, function(err) {
          if (err) {
            console.log(err);
            statusEl.textContent = 'AUTHENTICATION FAILED';
            return;
          }

          statusEl.textContent = 'AUTHENTICATED';
        });
      });
      client.once('close', function() {
        statusEl.textContent = 'CLOSED';
      });
      client.on('error', function(err) {
        console.log(err);
        statusEl.textContent = 'ERROR';
      });
      client.on('call', function(call) {
        statusEl.textContent = 'RINGING';

        // navigator.getUserMedia({video: true, audio: true},
          //success
          // function (stream) {
            // localVideo.src = URL.createObjectURL(stream);
            // call.accept(stream);
        call.accept();
          // },
          //error
        //   function(err) {
        //     console.error(err);
        //     global.alert('error');
        //   }
        // );

        call.once('localstream', function(stream) {
          localVideo.src = URL.createObjectURL(stream);
        });
        call.once('remotestream', function(stream) {
          remoteVideo.src = URL.createObjectURL(stream);
        });
        call.on('error', function(err) {
          console.trace(err);
        });
      });
    });
  });
})(this);
