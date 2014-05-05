### Password
##### Reset password
```javascript
client.exec('password:reset', EMAIL, function(err) {
  if (err)
    return console.log(err);

  console.log('an email was sent');
});
```
##### Change password
```javascript
client.exec('password', password, function(err) {
  if (err)
    return console.log(err);

  console.log('password has been changed');
});
```
If the password was successfully changed (no error) the server will close the connection, you'll have to open it again and authenticate again with the new password.


### Profile
##### Set Profile
```javascript
var profile = {
  fullname: 'John Doe',
  nickname: 'John',
  email: 'john@doe.com',
  birthday: '1234-12-30', //ISO 8601
  avatar: 'http://example.com/whatever.png',
  city: 'Denver',
  region: 'US-AL',
  gender: 'M', //M or F
  country: 'US'
};
client.exec('profile', profile, function(err) {
  if (err)
    return console.log(err);

  console.log('profile set');
});
```

Please note that for the avatar property you can directly define a File or Blob instance. In this case, a progress event is trigerred. The progress event matches the upload progress of the file.

```javascript
var profile = {
  avatar: Blob
};

client.exec('profile', profile,
  //done
  function(err) {
    if (err)
      console.log(err);
    else
      console.log('avatar set');
  },
  //progress
  function(sent, total) {
    //sent is the number of bytes sent
    //total is the size in bytes of the file
    if (total) {
      console.log('progress', (sent * 100 / total) + '%');
    }
  }
);
```

There is also an example in doc/set-profile.

##### Get profile
```javascript
client.exec('profile', function(err, profile) {
  if (err)
    return console.log(err);

  console.log(profile);
  //profile is a profile object as described above
});
```

### Chatstate
```javascript
var chatstate = {
  type: //either 'composing' or 'paused',
  user: //username
}
client.exec('chatstate', chatstate);
```
