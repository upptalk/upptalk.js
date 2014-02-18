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


### Message
##### Upload a file
```javascript
client.send('upload', file,
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
client.on('message', function(message) {

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