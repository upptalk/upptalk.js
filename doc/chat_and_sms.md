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
client.exec('receipt', receipt);
```
### Upload
```javascript
client.exec('upload', File, function(err, res) {

});
```


### Message
##### Upload a file
```javascript
client.exec('upload', file,
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
//or UppTalk group:
message.group = 'group id';
//or non UppTalk number recipient
message.number = 'phone number';

//
//Message type
//

//text
message.text = 'message';

//or file
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

//or location
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

client.exec('chat', message);
```

Please note that for file message you can directly define a File or Blob instance. In this case, a progress event is trigerred. The progress event matches the upload progress of the file.

```javascript
var message = {
  id: 'id',
  user: 'example',
  file: Blob
};

client.exec('chat', message,
  //done
  function(err, m) {
    if (err)
      return console.log(err);

    console.log('message sent');
    var file = m.file;
    file.size //size of the file
    file.url //url of the file
    file.type //type of the file

    var thumbnail = file.thumbnail;
    //thumbnail are only generated for videos and images, but even for those it might fail
    if (thumbnail) {
      thumbnail.size //size of the thumbnail
      thumbnail.url //url of the thumbnail
      thumbnail.type //type of the thumbnail
    }
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

There is also an example in ```example/send-file``` .