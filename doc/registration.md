Registration involve 2 steps.
The first one is a captcha to make sure the user is actually human.
The second one is the actual registration process.

```javascript
client.send('captcha', function(err, captcha) {
  if (err)
    return console.log(err);

  console.log(captcha);
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
Choices object is a list of key value pair.
The key ```'id'``` is the response to send within the registration payload.
The value is a base64 encoded image data URI.

The registration method will require you to send the token and captcha response (choice id).
```javascript
var payload = {
  username: '', //desired username
  password: '', //desired password
  email:    '', //email address
  captcha:  '', //the captcha id choice
  lang:     '', //ISO ISO 639-1 lang code e.g. en
                //see: https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
  token:    '', //the captcha token
};
client.send('register', payload, function(err) {
  if (err)
    return console.log(err);

  console.log('registered');
});
```