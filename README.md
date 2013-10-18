# yuilop.js

## Description
yuilop.js is a JavaScript library to consume, use and abuse yuilop APIs.

## Install
```shell
npm install https://github.com/yuilop/yuilop.js
```

## Include
###Node.JS
```javascript
var Y = require('yuilop.js');
```
###Browser
```xml
<script src="node_modules/yuilop.js/yuilop.js"></script>
```

## API

### Init
Create a yuilop.js client instance.
```javascript
var y = new Y(url);
```

### open
Open the connection.
```javascript
y.open(url);
```
### close
Close the connection.
```javascript
y.close();
```

### emit
Emit an event

If an answer from the server is expected:
```javascript
y.emit('event', payload, function(err, res) {
  console.log(err || res);
});
```
Otherwise
```javascript
y.emit('event', payload);
```

### on
Listen for a event.
```javascript
y.on('echo', function(payload, res, next) {
  var err;
  var ok;
  if (typeof payload === 'undefined')
    err = 'Payload must be set to be echoed';
  else
    ok = payload;

  if (res) //server expects an answer
    res(err, ok);

  next();
});
```

### use
use is similar to on but catch all remote events.
```javascript
y.use(function(req, res, next) {
  if (req.method !== 'echo')
    return next();

  var err;
  var ok;
  if (typeof req.payload === 'undefined')
    err = 'Payload must be set to be echoed';
  else
    ok = payload;

  if (res) //server expects an answer
    res(err, ok);

  //next() we don't call it so that other listeners aren't called
});
```

## Events - local

### open
Emitted when the connection is open.
```javascript
y.on('open', function() {
  console.log('open');
});
```

### message
Emitted for every incoming message.
```javascript
y.on('message', function(message) {
  console.log('message in:');
  console.log(message);
});
```

### sent
Emitted for every sent message.
```javascript
y.on('send', function(message) {
  console.log('message out:');
  console.log(message);
});
```

### error
Emitted when a connection error occurs.
```javascript
y.on('error', function(err) {
  console.log('ERROR:')
  console.log(err);
});
```

### close
Emitted when the connection gets closed.
```javascript
y.on('close', function() {
  console.log('close');
});
```




## Events - remote

### Presence
##### Listen presence
```javascript
Y.on('presence', function(presence) {
  //presence.user is user id
  //presence.type can be either 'online' or 'offline'
});
```
##### Send presence
```javascript
var presence = {
  type: //'online' or 'offline'
};
//if data is omited, {type: 'online'} is assumed.
Y.emit('presence'[, data]);
```
### Energy
##### Get energy left
```javascript
Y.emit('energy', function(err, energy) {
 //energy is an number
});
```
##### Get energy remaining
```javascript
//if number is omited, user number is assumed
Y.emit('remaining', [number,] function(err, energy) {
  //energy.sms is the number of SMS left for the given number
  //energy.voice is the number of seconds left for the given number
  //both of them are a number or 'unlimited'
});
```
### Receipts
##### Listen receipt
```javascript
Y.on('receipt', function(receipt) {
  //receipt.id is the message id concerned
  //receipt.type can be 'sent' or 'received' or 'read' or 'error'
});
```
##### Send receipt
```javascript
var receipt = {
  id: //message id,
  type: //'received' or 'read'
}
Y.emit('receipt', receipt);
```
### Chatstate
##### Listen chatstate
```javascript
Y.on('chatstate', function(chatstate) {
  //chatstate.user is user id
  //chatste.type is 'composing' or 'paused'
})
```
##### Send chatstate
```javascript
var chatstate = {
  type: //either 'composing' or 'paused'
}
Y.emit('chatstate', chatstate);
```
### Last activity
##### Get last activity
```javascript
var lastactivity = {
  user: //user id
}
Y.emit('lastactivity', lastactivity, function(err, lastActivity) {
  //lastActivity is a number, in seconds of user's last activity
});
```
### Phone numbers
##### Get associated phone numbers for a number
```javascript
//Number must be a E164 formated phone number
Y.emit('phonenumbers', number, function(err, phonenumbers) {
  //phonenumbers.real is the real user phone number
  //phonenumbers.yuilop is the useryuilop + number
  
  //phonenumbers.real must always be used as the user id even for + numbers
  //if nor real or yuilop is present, it means the number isn't registed
});
```
### Groupchats
##### Listen groupchat FIXME
A groupchat event is received when the user join a groupchat
```javascript
Y.on('groupchat', function(err, groupchat) {
  //groupchat.id is the groupchat id
});
```
##### Get groupchats
```javascript
Y.emit('groupchats', function(err, groupchats) {
  //groupchats is an array of groupchat objects
  for (var i = 0; i < groupchats.length; i++) {
    console.log('groupchat id :' groupchats[i].id);
    console.log('groupchat name :' groupchats[i].name);
  }
});
```
##### Get groupchat participants
```javascript
Y.emit('participants', {groupchat: id}, function(err, participants) {
  //participants is an array of participant objects
  for (var i = 0; i < participants.length; i++) {
    console.log('participant user id :' participants[i].user);
    console.log('participant name :' participants[i].name);
  }
});
```
### Message
##### Upload a file
```javascript
Y.emit('upload', file,
  //when request completes
  function(err, result) {
  },
  //when progress
  function(progress) {
    //progress is a % number
  }
);
```
##### Listen message
```javascript
Y.on('message', function(message) {
  
});
```
##### Send message
```javascript
Y.emit('message', message);
```
### Storage
##### Listen storage FIXME
```javascript
Y.on('storage', function(storage) {
})
```
##### Get storage
```javascript
Y.emit('storage', function(err, storage) {

});
```