## Conditions

The usage of UppTalk.js with UppTalk services is subject to conditions.

Those conditions are simple specifications on applications behaviors ensuring best service quality for users.

### Authentication

Condition: if platform/context allows it

When the application gets user credentials it should store the response token and reuse it for further authentication.

If server respond to the authentication token request with an error, the application should re-authenticate with user credentials or ask the user for credentials.
The response token should be stored and reused for further authentication.

### Presence

Condition: if platform/context allows it

When sending presence, the application MUST store the device id and reuse it for further presence request.
The application MAY store the user credentials (username and password) too.

Condition: required

If the presence request is sent before retrieving contacts or the user start a session with a new contact, the application MIGHT receive presence events before processing contacts.
The application MUST cache all presence states.
If a contact is processed after receiving a ```online``` presence event, the contact presence state is ```online```, if a contat is processed after receiving a ```offline``` presence event or before receiving any presence event, the contact presence state is ```offline```.

### Chat

#### Receipt

Condition: required

The application must send a ```received``` receipt event as soon as a chat message is received.

```read``` receipt event is optional and your application might allow user to disable it to protect their privacy.

If the application is to send a read receipt, only the read receipt event should be sent ```read``` receipt event prevail on the ```received``` receipt.

#### Duplicates

Condition: required

Even though your application sends the ```received``` or ```read``` receipt, the server might send the message again. In that case the message must be ignored.
Only 2 messages from the same user/number/group with the same id are considered duplicates.


### Chatstate

Condition: required

If a contact chat state is ```composing``` and a ```paused``` chatstate event hasn't been received within 45 seconds, the application must switch contact chat state to ```paused```.

Condition: if platform/context allows it

A composing chatstate event must be sent when:

- User stats typing and last sent chat state event was composing

A paused chatstate event must be sent:

- After 2 seconds of typing inactivity
- When user goes away from the conversation (close application, change view, goes back, ...)
- When the typed message has been sent