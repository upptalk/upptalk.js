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
<script src="bower_components/upptalk/dist/upptalk.min.js"></script>
```

## API

### Init
Create a UppTalk client instance.
```javascript
var client = new UppTalk({apikey: 'YOUR-API-KEY'});
```
### Open
Open the connection.
```javascript
client.open();
client.on('open', function() {
  //connection is open
});
```
### Close
Close the connection.
```javascript
client.close();
client.on('close', function() {
  //connection has been closed
});
```
Please note that the close event is emitted if the connection gets closed. It can happen without calling ```client.close();```.
### Error event
The error event is emmited when a network error occurs.
```javascript
client.on('error', function(error) {
  console.log(error);
});
```
### Log traffic
Send and message events are emitted respectively when a message is sent and when a message is received.
```javascript
client.on('send', function(message) {
  console.log('OUT:', message);
});
client.on('message', function(message) {
  console.log('IN:', message);
});
```

### Miscellaneous

##### Keepalive
UppTalk.js includes a keepalive system. If no message has been received since 5 seconds, a ping will be sent to the server. If no pong has been received within 2.5 seconds, a close event will be emitted.

The interval and timeout are configurable (in miliseconds) before opening the connection.
```javascript
client.keepalive = 10*1000; //10 seconds
client.timeout = 5*1000; //5 seconds
```

You can disable keepalives
```javascript
client.keepalive = false;