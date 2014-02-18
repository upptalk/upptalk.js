##### Create group
```javascript
client.send('group', function(err, id) {
  if (err)
    return console.log(err);

  console.log(id);
  //id is the id of the newly created group
});
```
##### Name/rename group
```javascript
client.send('group:name', {group: 'id', name: 'name'}, function(err) {
  if (err)
    return console.log(err);

  console.log('group was renamed');
});
```
##### Invite user to join group
Only a group owner (creator) can send an invitation.
```javascript
var invitation = {group: 'id', user: 'username'};
client.send('group:invite', invitation, function(err) {
  if (err)
    return console.log(err);

  console.log('user has been invited');
});
```
##### Kick user from group
```javascript
var kick = {group: 'id', user: 'username'};
client.send('group:kick', kick, function(err) {
  if (err)
    return console.log(err);

  console.log('user has been kicked out of the group');
});
```
##### Leave group
```javascript
client.send('group:leave', 'group', function(err) {
  if (err)
    return console.log(err);

  console.log('you left the group');
});
```
##### Listen group
A group event is received when the user join a group
```javascript
client.on('group', function(group) {
  console.log(group);
  //group.id is the group id
});
```
##### Get groups
```javascript
client.send('groups', function(err, groups) {
  if (err)
    return console.log(err);

  //groups is an array of group objects
  for (var i = 0; i < groups.length; i++) {
    console.log('group id :' groups[i].id);
    console.log('group name :' groups[i].name);
  }
});
```
##### Get group members
```javascript
client.send('group:members', group, function(err, members) {
  if (err)
    return console.log(err);

  //members is an array
  for (var i = 0; i < members.length; i++) {
    console.log('member user id :' members[i].user);
    console.log('member name :' members[i].name);
  }
});
```