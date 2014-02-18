<!-- upptalk.js
==========

UppTalk client JavaScript library

[![NPM version](https://badge.fury.io/js/upptalk.png)](https://npmjs.org/package/upptalk)
[![Build Status](https://travis-ci.org/upptalk/upptalk.js.png?branch=master)](https://travis-ci.org/upptalk/upptalk.js)

[![Dependency Status](https://david-dm.org/upptalk/upptalk.js.png)](https://david-dm.org/upptalk/upptalk.js)
[![devDependency Status](https://david-dm.org/upptalk/upptalk.js/dev-status.png)](https://david-dm.org/upptalk/upptalk.js#info=devDependencies)

## Node.js
##### Install
```shell
npm install upptalk
```
##### Include
```javascript
var UppTalk = require('upptalk');
```
## Browser
##### Install
```shell
bower install upptalk
```
##### Include
```xml
<script src="bower_components/upptalk/dist/upptalk.js"></script>
```

## API

### init
Create a UppTalk client instance.
```javascript
var client = new UppTalk({apikey: 'YOUR-API-KEY'});
```
### open
Open the connection.
```javascript
client.open();
```
### close
Close the connection.
```javascript
client.close();
```

### send
Request
```javascript
client.send('event', payload, function(err, res) {
  console.log(err || res);
});
```
Event
```javascript
client.send('event', payload);
```

### on
Listen for an event.
```javascript
client.on('event', function(payload) {
  console.log(payload);
});
```
### once
Listen for an event once (one time only).
```javascript
client.once('event', function(payload) {
  console.log(payload);
});
```

## Events - local

### open
Emitted when the connection is open.
```javascript
client.on('open', function() {
  console.log('open');
});
```

### message
Emitted for every incoming message.
```javascript
client.on('message', function(message) {
  console.log('message in:');
  console.log(message);
});
```

### sent
Emitted for every sent message.
```javascript
client.on('send', function(message) {
  console.log('message out:');
  console.log(message);
});
```

### error
Emitted when a connection error occurs.
```javascript
client.on('error', function(err) {
  console.log('ERROR:')
  console.log(err);
});
```

### close
Emitted when the connection gets closed.
```javascript
client.on('close', function() {
  console.log('close');
});
```

## Events - remote

### User
##### Register
```javascript
client.send('captcha', function(err, captcha) {
  //captcha object example {
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
You'll have then to send the token and the choice id.
```javascript
var payload = {
  username: '',
  password: '',
  email:    '',
  captcha:  '', //the captcha id choice
  lang:     '', //ISO lang code e.g. es
  token:    '', //the captcha token
};
client.send('register', payload, function(err) {
  console.log(err);
});
```
##### Authenticate
```javascript
client.send('authenticate', {username: USERNAME, password: PASSWORD}, function(err) {
  console.log(err);
});
```
##### Change password
```javascript
client.send('password', password, function(err) {
  console.log(err);
});
```
If the password was succefully changed, (no error) the server will close the connection, you'll have to open it again and authenticate again with the new password.
##### Reset password
```javascript
client.send('password:reset', EMAIL, function(err) {
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
client.send('profile', profile, function(err) {
  if (err)
    return console.log(err);
});
```
##### Get profile
```javascript
client.send('profile', function(err, profile) {
  //profile is a profile object as described below
});
```
##### Get user profile
```javascript
client.send('profile', username, function(err, profile) {
  //profile is a profile object as described below
});
```
### Presence
##### Listen presence
```javascript
client.on('presence', function(presence) {
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
client.send('presence'[, data]);
```
### Energy
##### Listen for energy events
If an action that involves energy change is made, server will push an energy notification to the client.
For example if you send a chat message to a non-registered number.
```javascript
client.on('energy', function(energy) {
  console.log(energy);
  //'123.53'
});
```
##### Get energy left
You can request energy left to the server be sendting an energy event.
```javascript
client.send('energy', function(err, energy) {
  console.log(energy);
  //'123.53'
});
```
##### Get remaining SMS/minutes
```javascript
//if number is omited, user number is assumed
client.send('remaining', [number,] function(err, energy) {
  //energy.sms is the number of SMS left for the given number
  //energy.voice is the number of seconds left for the given number
  //both of them are a number or 'unlimited'
});
```
### Receipts
##### Listen receipt
```javascript
client.on('receipt', function(receipt) {
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
client.send('receipt', receipt);
```
### Upload
```javascript
client.send('upload', File, function(err, res) {

});
```
### Chatstate
##### Listen chatstate
```javascript
client.on('chatstate', function(chatstate) {
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
client.send('chatstate', chatstate);
```
### Last activity
##### Get last activity
```javascript
client.send('last-activity', username, function(err, lastActivity) {
  //lastActivity is a string of seconds since user's last activity
});
```
### Phone numbers
##### Get associated phone numbers for a number
```javascript
//Number must be a E164 formated phone number
client.send('phonenumbers', number, function(err, phonenumbers) {
  //phonenumbers.real is the real phone number
  //phonenumbers.yuilop is the virtual phone number

  //phonenumbers.real must always be used as the user id even for + numbers
  //if nor real or yuilop is present, it means the number isn't registered
});
```
### Contacts
##### Get contacts
```javascript
client.send('contacts', function(err, contacts) {
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
client.send('contacts', patch, function(err) {
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
client.send('contacts', patch, function(err) {
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
client.on('sync', sync, function(err, synced) {
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
client.send('group', function(err, id) {
  //id is the id of the newly created group
});
```
##### Name/rename group
```javascript
client.send('group:name', {group: 'group', name: 'name'}, function(err) {
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

//UppTalk user:
message.user = 'username';
//UppTalk group:
message.group = 'group id';
//non UppTalk number recipient
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

client.send('chat', message);
```
### Storage
##### Listen storage FIXME
```javascript
client.on('storage', function(storage) {
})
```
##### Get storage
```javascript
client.send('storage', function(err, storage) {

});
```

## Miscellaneous

### Keepalive
UppTalk.js includes a keepalive system. If no message has been received since 5 seconds, a ping will be sent to the server. If no pong has been received within 2.5 seconds, a close event will be emitted.

The interval and timeout are configurable (in miliseconds) before opening the connection.
```javascript
client.keepalive = 10*1000; //10 seconds
client.timeout = 5*1000; //5 seconds
```

You can disable keepalives
```javascript
client.keepalive = false;
```

 -->