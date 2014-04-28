##### Get credit left
```javascript
client.exec('credit', function(err, credit) {
  if (err)
    return console.log(err);

  console.log(credit);
  //'123.53'
});
```
##### Listen for credit events
If the user do something that involves loosing or winning credit, server will send a credit event to the client.
For example if a SMS is sent.
```javascript
client.on('credit', function(credit) {
  console.log(credit);
  //'123.13'
});
```
##### Get remaining SMS/minutes
```javascript
//if number is omited, user number is assumed
client.exec('remaining', [number,] function(err, remaining) {
  if (err)
    return console.log(err);

  //remaining.sms is the number of SMS left for the given number
  //remaining.voice is the number of seconds left for the given number
  //both of them are a integer or 'unlimited'
});
```