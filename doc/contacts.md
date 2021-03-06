### Manage contacts
##### Get contacts
```javascript
client.exec('contacts', function(err, contacts) {
  if (err)
    return console.log(err);

  console.log(contacts);
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
client.exec('contacts', patch, function(err) {
  if (err)
    return console.log(err);

  console.log('contact added');
});
```
##### Remove contact
```javascript
var patch = [{
  op: 'remove',
  path: '/id'
}];
client.exec('contacts', patch, function(err) {
  if (err)
    return console.log(err);

  console.log('contact removed');
});
```
##### Events
If contacts has been aletered on a device, other conntected devices will receive a notification with the payload.
```javascript
client.on('contacts', function(payload) {
  console.log(payload);
});
```
### Sync
You can send a list of ids of different services and get associated upptalk username.
```javascript
//valid types are 'username', 'phone', 'fb', 'email', 'twitter', 'gplus', 'linkedin'
//username is type for upptalk usernames
//each type can be an id or an array of ids
var sync = {
  phone: ['+33651090039'],
  username: ['janedoe'],
  twitter: 'cuicui'
};
client.exec('sync', sync, function(err, synced) {
  if (err)
    return console.log(err);

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
### Phones
Phones method will return the phone numbers associated to a username.
```javascript
client.exec('phones', username, function(err, phones) {
  if (err)
    return console.log(err);

  console.log(phones);
  //phones.real is the real, verified phone number
  //phones.virtual is the virtual phone number
});
```
### Get profile
```javascript
client.exec('profile', username, function(err, profile) {
  if (err)
    return console.log(err);

  console.log(profile);
  //profile object example {
  //  avatar: 'URL',
  //  fullname: 'John Doe',
  //  nickname: 'John'
});
```
### Get last activity
```javascript
client.exec('last-activity', username, function(err, lastActivity) {
  if (err)
    return console.log(err);

  console.log(lastActivity);
  //lastActivity is a string of seconds since user's last activity
});
```

### Listen chatstate
```javascript
client.on('chatstate', function(chatstate) {
  //chatstate.user is user id
  //chatste.type is 'composing' or 'paused'
});
```

### Listen presence
```javascript
client.on('presence', function(presence) {
  //presence.user is user id
  //presence.type can be either 'online' or 'offline'
});
```