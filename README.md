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
<script src="yuilop.js/yuilop.js"></script>
```
For minified version
```xml
<script src="yuilop.js/yuilop.min.js"></script>
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

### send
Request
```javascript
y.send('event', payload, function(err, res) {
  console.log(err || res);
});
```
Event
```javascript
y.send('event', payload);
```

### on
Listen for an event.
```javascript
y.on('event', function(payload) {
  console.log(payload);
});
```
### once
Listen for an event once (one time only).
```javascript
y.once('event', function(payload) {
  console.log(payload);
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
y.send('captcha', function(err, captcha) {
  //captcha object is similar to {
  //  "token": "TOKEN",
  //  "question": "Where is the heart?",
  //  "choices": {
  //    "id": "data:image/png;base64,DATA",
  //    "id": "data:image/png;base64,DATA",
  //    "id": "data:image/png;base64,DATA",
  //  }
  //}
});
```
You'll have then to send the token and the choice array index.
```javascript
var payload = {
  username: '',
  password: '',
  email:    '',
  captcha:  '', //the captcha id choice
  lang:     '', //ISO lang code e.g. es
  token:    '', //the captcha token
};
y.send('register', payload, function(err) {
  console.log(err);
});
```
##### Authenticate
```javascript
y.send('authenticate', {username: USERNAME, password: PASSWORD}, function(err) {
  console.log(err);
});
```
##### Change password
```javascript
y.send('password', password, function(err) {
  console.log(err);
});
```
If the password was succefully changed, (no error) the server will close the connection, you'll have to open it again and authenticate again with the new password.
##### Reset password
```javascript
y.send('password:reset', EMAIL, function(err) {
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
y.send('profile', profile, function(err) {
  if (err)
    return console.log(err);
});
```
##### Get profile
```javascript
y.send('profile', function(err, profile) {
  //profile is a profile object as described below
});
```
##### Get user profile
```javascript
y.send('profile', username, function(err, profile) {
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
y.send('presence'[, data]);
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
You can request energy left to the server be sendting an energy event.
```javascript
y.send('energy', function(err, energy) {
  console.log(energy);
  //'123.53'
});
```
##### Get remaining SMS/minutes
```javascript
//if number is omited, user number is assumed
y.send('remaining', [number,] function(err, energy) {
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
y.send('receipt', receipt);
```
### Upload
```javascript
y.send('upload', File, function(err, res) {

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
  type: //either 'composing' or 'paused',
  user: //username
}
y.send('chatstate', chatstate);
```
### Last activity
##### Get last activity
```javascript
y.send('last-activity', username, function(err, lastActivity) {
  //lastActivity is a string of seconds since user's last activity
});
```
### Phone numbers
##### Get associated phone numbers for a number
```javascript
//Number must be a E164 formated phone number
y.send('phonenumbers', number, function(err, phonenumbers) {
  //phonenumbers.real is the real user phone number
  //phonenumbers.yuilop is the useryuilop + number

  //phonenumbers.real must always be used as the user id even for + numbers
  //if nor real or yuilop is present, it means the number isn't registed
});
```
### Contacts
##### Get contacts
```javascript
y.send('contacts', function(err, contacts) {
  console.log(err || contacts);
});
```
##### Add contact
```javascript
var patch = [{
  op: 'add',
  path: '/id',
  value: {
    name: 'John Doe',
    ids: [
      {type: 'username', value: 'johndoe'}
    ]
  }
}];
y.send('contacts', patch, function(err) {
  if (err)
    console.log(err);
});
```
##### Remove contact
```javascript
var patch = [{
  op: 'remove',
  path: '/id'
}];
y.send('contacts', patch, function(err) {
  if (err)
    console.log(err);
});
```
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
##### Create group
```javascript
y.send('group', function(err, id) {
	//id is the id of the newly created group
});
```
##### Name/rename group
```javascript
y.send('group:name', {group: 'group', name: 'name'}, function(err) {
});
```
##### Invite user to join group
Only a group owner can send an invitation.
```javascript
var invitation = {group: 'group', user: 'username'};
y.send('group:invite', invitation, function(err) {
});
```
##### Kick user from group
```javascript
var kick = {group: 'group', user: 'username'};
y.send('group:kick', kick, function(err) {
});
```
##### Leave group
```javascript
y.send('group:leave', 'group', function(err) {
});
```
##### Listen group
A group event is received when the user join a group
```javascript
y.on('group', function(err, group) {
  //group.id is the group id
});
```
##### Get groups
```javascript
y.send('groups', function(err, groups) {
  //groups is an array of group objects
  for (var i = 0; i < groups.length; i++) {
    console.log('group id :' groups[i].id);
    console.log('group name :' groups[i].name);
  }
});
```
##### Get group members
```javascript
y.send('group:members', group, function(err, members) {
  //members is an array
  for (var i = 0; i < members.length; i++) {
    console.log('member user id :' members[i].user);
    console.log('member name :' members[i].name);
  }
});
```
### Message
##### Upload a file
```javascript
y.send('upload', file,
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
//yuilop group:
message.group = 'group id';
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

y.send('chat', message);
```
### Storage
##### Listen storage FIXME
```javascript
y.on('storage', function(storage) {
})
```
##### Get storage
```javascript
y.send('storage', function(err, storage) {

});
```

## Miscellaneous

### Keepalive
yuilop.is includes a keepalive system. If no message has been received since 5 seconds, a ping will be sent to the server. If no pong has been received within 2.5 seconds, a close event will be emitted.

The interval and timeout are configurable (in miliseconds) before opening the connection.
```javascript
y.keepalive = 10*1000; //10 seconds
y.timeout = 5*1000; //5 seconds
```

You can disable keepalives
```javascript
y.keepalive = false;
```

