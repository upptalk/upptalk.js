The registration method will require you to send the token and captcha response (choice id).
```javascript
var payload = {
  username: '', //desired username
  password: '', //desired password
  email:    '', //email address
  lang:     '', //ISO ISO 639-1 lang code e.g. en
                //see: https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
};
client.exec('register', payload, function(err) {
  if (err)
    return console.log(err);

  console.log('registered');
});
```