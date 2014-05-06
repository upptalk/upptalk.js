##### Audio and video call

There is an example that shows how to handle both calling and answering cases in example/call.

###### Feature detection

UppTalk.js calls use WebRTC and isn't supported everywhere yet.

```javascript
if (client.Call) {
  //calls supported
}
else {
  //calls unsupported
}
```

###### Calling

```javascript
var payload = {
  user: 'foo',
  audio: true, //optional, default false
  video: true //optional, default false
};

client.exec('call', payload, function(err, call) {
  if (err)
    return console.log(err);

  var localVideo;
  var remoteVideo;
  var localStream;
  var remoteStream;

  //user foo accepted the call
  call.once('accept', function() {
    console.log(payload.user + ' accepted the call')
  });

  //user foo rejected the call
  call.once('reject', function() {
    console.log(payload.user + ' refused the call');
  });

  //user foo hanged up the call
  call.once('hangup', function() {
    console.log(payload.user + ' hanged up the call');

    if (remoteStream)
      remoteStream.stop();
    if (localStream)
      remoteStream.stop();

    if (remoteVideo && remoteVideo.src) {
      URL.revokeObjectURL(remoteVideo.src);
      remoteVideo.src = '';
    }
    if (localVideo && localVideo.src) {
      URL.revokeObjectURL(localVideo.src);
      localVideoVideo.src = '';
    }
  });

  //local media streaming
  call.once('local', function(local) {
    //local.audio is a boolean defining if the stream contains audio
    //local.video is a boolean defining if the stream contains video
    //local.stream is the actual MediaStream

    localStream = local.stream;
    localVideo = document.createElement('video');
    localVideo.id = 'local';
    localVideo.muted = true; //user doesn't want to hear himself
    localVideo.autoplay = true;
    localVideo.src = URL.createObjectURL(local.stream);
    document.body.appendChild(localVideo);
  });

  //remote media streaming
  call.once('remote', function(remote) {
    //remote.audio is a boolean defining if the stream contains audio
    //remote.video is a boolean defining if the stream contains video
    //remote.stream is the actual MediaStream

    remoteStream = remote.stream;
    remoteVideo = document.createElement('video');
    remoteVideo.id = 'remote';
    remoteVideo.autoplay = true;
    remoteVideo.src = URL.createObjectURL(remote.stream);
    document.body.appendChild(remoteVideo);
  });

  //something wrong happened with the call
  call.once('error', function(err) {
    console.log(err);
  });

  //you can hangup the call with
  //call.hangup();
});
```


###### Answering

```javascript
client.on('call', function(call) {


  //call.user is the username of the user calling
  //call.video is a boolean defining if the user will send video
  //call.audio is a boolean defining if the user will send audio

  console.log(call.user + ' is calling');
  console.log(call.user + ' will send audio: ' + call.audio);
  console.log(call.user + ' will send video: ' + call.video);

  var localVideo;
  var remoteVideo;
  var localStream;
  var remoteStream;


  //accept the call
  call.accept({
    audio: true, //optional, default matches call.audio
    video: false //optional, default matches call.video
  });

  //OR

  //reject the call
  call.reject();


  //caller hanged up the call
  call.once('hangup', function() {
    console.log(call.user + ' hanged up the call');

    if (remoteVideo)
      URL.revokeObjectURL(remoteVideo.src);
    if (remoteStream)
      remoteStream.stop();
    if (localVideo)
      URL.revokeObjectURL(localVideo.src);
    if (localStream)
      remoteStream.stop();
  });

  //local media streaming
  call.once('local', function(local) {
    //local.audio is a boolean defining if the stream contains audio
    //local.video is a boolean defining if the stream contains video
    //local.stream is the actual MediaStream

    localStream = local.stream;
    localVideo = document.createElement('video');
    localVideo.id = 'local';
    localVideo.muted = true; //user doesn't want to hear himself
    localVideo.autoplay = true;
    localVideo.src = URL.createObjectURL(local.stream);
    document.body.appendChild(localVideo);
  });

  //remote media streaming
  call.once('remote', function(remote) {
    //remote.audio is a boolean defining if the stream contains audio
    //remote.video is a boolean defining if the stream contains video
    //remote.stream is the actual MediaStream

    remoteStream = remote.stream;
    remoteVideo = document.createElement('video');
    remoteVideo.id = 'remote';
    remoteVideo.autoplay = true;
    remoteVideo.src = URL.createObjectURL(remote.stream);
    document.body.appendChild(remoteVideo);
  });

  //something wrong happened with the call
  call.once('error', function(err) {
    console.log(err);
  });

  //you can hangup the call with
  //call.hangup();
});
```
