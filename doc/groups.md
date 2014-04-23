##### Create group
path is optional
```javascript
client.send('group', {name: 'foo bar', path: 'foo-bar'}, function(err, id) {
  if (err)
    return console.log(err);

  console.log(id);
  //id is the id of the newly created group
});
```
##### Edit group
You can change path or name or both.
Only the group creator can edit a group.
```javascript

client.send('group', {id: 'id', name: 'new name', path: 'new-path'}, function(err) {
  if (err)
    return console.log(err);

  console.log('group was edited');
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
A group event is received when the user has been invited to a group as well as when a group name and/or path has be changed
```javascript
client.on('group', function(group) {
  console.log(group);
  //group.id is the group id
  //group.name is the group name
  //group.path is the group path
});
```
##### Get groups
```javascript
client.send('groups', function(err, groups) {
  if (err)
    return console.log(err);

  //groups is an array of group objects
  for (var i = 0; i < groups.length; i++) {
    console.log('group id:', groups[i].id);
    console.log('group name:', groups[i].name);
    console.log('group path:', groups[i].path);
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