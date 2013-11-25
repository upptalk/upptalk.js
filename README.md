# yuilop.js

## Description
yuilop.js is a JavaScript library to consume, use and abuse yuilop APIs.

## Install
```shell
npm install https://github.com/yuilop/yuilop.js
```

##### For browser usage:
```shell
npm install -g grunt-cli
grunt build
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
var y = new Y(options);
```
options argument is a optional. If it's not defined, yuilop production environment will be used.
```javascript
var options = {
  hostname : 'example.com',
  port: 443,
  secure: true
};
```

### open
Open the connection.
```javascript
y.open();
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

### User
##### Register
```javascript
y.emit('captcha', function(err, captcha) {
  //captcha object is similar to {
  //  "token": "TOKEN",
  //  "question": "Where is the heart?",
  //  "choices": [
  //    "data:image/png;base64,DATA",
  //    "data:image/png;base64,DATA",
  //    "data:image/png;base64,DATA",
  //  ]
  //}
});
```
You'll have then to send the token and the choice array index.
```javascript
var payload = {
  username: '',
  password: '',
  email:    '',
  captcha:  '', //the captcha choice array index
  lang:     '', //ISO lang code e.g. es
  token:    '', //the captcha token
};
y.emit('register', payload, function(err) {
  console.log(err);
});
```
##### Authenticate
```javascript
y.emit('authenticate', {username: USERNAME, password: PASSWORD}, function(err) {
  console.log(err);
});
```
##### Change password
```javascript
y.emit('password', password, function(err) {
  console.log(err);
});
```
If the password was succefully changed, (no error) the server will close the connection, you'll have to open it again and authenticate again with the new password.
##### Reset password
```javascript
y.emit('password:reset', EMAIL, function(err) {
  console.log(err);
});
```
### Profile
##### Set Profile
```javascript
var profile = {
  fullname: 'John Doe',
  nickname: 'John',
  email: 'john@doe.com',
  birthday: '1234-12-30',
  avatar: 'http://example.com/whatever.png',
  city: 'Denver',
  region: 'US-AL',
  country: 'US'
};
y.emit('profile', profile, function(err) {
  if (err)
    return console.log(err);
});
```
##### Get profile
```javascript
y.emit('profile', function(err, profile) {
  //profile is a profile object as described below
});
```
##### Get user profile
```javascript
y.emit('profile', username, function(err, profile) {
  //profile is a profile object as described below
});
```
### Presence
##### Listen presence
```javascript
y.on('presence', function(presence) {
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
y.emit('presence'[, data]);
```
### Energy
##### Listen for energy events
If an action that involves energy change is made, server will push an energy notification to the client.
For example if you send a chat message to a non-registered number.
```javascript
y.on('energy', function(energy) {
  console.log(energy);
  //'123.53'
});
```
##### Get energy left
You can request energy left to the server be emitting an energy event.
```javascript
y.emit('energy', function(err, energy) {
  console.log(energy);
  //'123.53'
});
```
##### Get remaining SMS/minutes
```javascript
//if number is omited, user number is assumed
y.emit('remaining', [number,] function(err, energy) {
  //energy.sms is the number of SMS left for the given number
  //energy.voice is the number of seconds left for the given number
  //both of them are a number or 'unlimited'
});
```
### Receipts
##### Listen receipt
```javascript
y.on('receipt', function(receipt) {
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
y.emit('receipt', receipt);
```
### Upload
```javascript
y.emit('upload', File, function(err, res) {

});
```
### Chatstate
##### Listen chatstate
```javascript
y.on('chatstate', function(chatstate) {
  //chatstate.user is user id
  //chatste.type is 'composing' or 'paused'
})
```
##### Send chatstate
```javascript
var chatstate = {
  type: //either 'composing' or 'paused'
}
y.emit('chatstate', chatstate);
```
### Last activity
##### Get last activity
```javascript
var lastactivity = {
  user: //user id
};
y.emit('last-activity', lastactivity, function(err, lastActivity) {
  //lastActivity is a number, in seconds of user's last activity
});
```
### Phone numbers
##### Get associated phone numbers for a number
```javascript
//Number must be a E164 formated phone number
y.emit('phonenumbers', number, function(err, phonenumbers) {
  //phonenumbers.real is the real user phone number
  //phonenumbers.yuilop is the useryuilop + number

  //phonenumbers.real must always be used as the user id even for + numbers
  //if nor real or yuilop is present, it means the number isn't registed
});
```
### Contacts
##### Sync contacts
You can send a list of ids of different services and get associated upptalk username.
```javascript
//valid types are 'username', 'phone', 'fb', 'email', 'twitter', 'gplus', 'linkedin'
//username is type for upptalk usernames
//each type can by an id or an array of ids
var sync = {
  phone: ['+33651090039'],
  username: ['janedoe'],
  twitter: 'cuicui'
};
y.on('sync', sync, function(err, synced) {
  console.log(synced);
  //{
  //  'phone': {
  //    '+33651090039': 'johndoe', //username for this number is 'johnedoe'
  //  },
  //  'username': {
  //    'janedoe': 'janedoe', //this username is a registered account
  //  },
  //  'twitter': {
  //    'cuicui': false //this twitter id isn't a registered account
  //  }
  //}
});
```
### Groupchats
##### Listen groupchat FIXME
A groupchat event is received when the user join a groupchat
```javascript
y.on('groupchat', function(err, groupchat) {
  //groupchat.id is the groupchat id
});
```
##### Get groupchats
```javascript
y.emit('groupchats', function(err, groupchats) {
  //groupchats is an array of groupchat objects
  for (var i = 0; i < groupchats.length; i++) {
    console.log('groupchat id :' groupchats[i].id);
    console.log('groupchat name :' groupchats[i].name);
  }
});
```
##### Get groupchat participants
```javascript
y.emit('participants', {groupchat: id}, function(err, participants) {
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
y.emit('upload', file,
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
y.on('message', function(message) {

});
```
##### Send message
```javascript
var message = {
  id: 'id'
};
//
//Recipient
//

//yuilop user:
message.user = 'username';
//yuilop groupchat:
message.groupchat = 'groupchat id';
//non-yuilop number recipient
message.number = 'phone number';

//
//Message type
//

//text
message.text = 'message';
//file
message.file = {
  url: 'https://example.com/file.jpeg',
  size: '1234',
  type: 'image/jpeg',
  thumbnail: {
    url: 'https://example.com/thumbnail.jpeg',
    size: '234',
    type: 'image/jpeg'
  }
};
//location
message.location = {
  url: 'https://maps.google.com/example',
  latitude: '34.4322',
  longitude: '12.1234',
  thumbnail: {
    url: 'https://maps.google.com/thumbnail.png',
    type: 'image/png',
    size: '1234'
  }
};

y.emit('message', message);
```
### Storage
##### Listen storage FIXME
```javascript
y.on('storage', function(storage) {
})
```
##### Get storage
```javascript
y.emit('storage', function(err, storage) {

});
```