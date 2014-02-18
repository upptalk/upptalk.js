Once the connection is open, the user can be authenticated using
```javascript
client.send('authenticate', {username: USERNAME, password: PASSWORD}, function(err) {
  if (err)
    return console.log(err);

  console.log('authenticated');
});
```

It is also possible to request for an authentication token. A token is valid 30 days.
```javascript
var authToken;
client.send('authenticate', {username: USERNAME, password: PASSWORD, token: true}, function(err, token) {
  if (err)
    return console.log(err);

  authToken = token;
  console.log('authenticated');
});
```

You can store that token and use it again to authenticate without storing username/password
```javascript
client.send('authenticate', {token: authToken}, function(err) {
  if (err)
    return console.log(err);

  console.log('authenticated');
});
```

Once you are authenticated, it is recommended to send presence so that others knows you are online.
```javascript
client.send('presence');
```