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
<script src="bower_components/upptalk/dist/upptalk.js"></script>
```

## API

### init
Create a UppTalk client instance.
```javascript
var client = new UppTalk({apikey: 'YOUR-API-KEY'});
```
### open
Open the connection.
```javascript
client.open();
client.on('open', function() {
  //do something
});
```