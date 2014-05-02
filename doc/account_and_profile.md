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
  birthday: '1234-12-30',
  avatar: 'http://example.com/whatever.png',
  city: 'Denver',
  region: 'US-AL',
  country: 'US'
};
client.exec('profile', profile, function(err) {
  if (err)
    return console.log(err);

  console.log('profile set');
});
```
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
