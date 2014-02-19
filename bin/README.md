# UppTalk.js command line tool

UppTalk command line tool client

## Install
You need Node.js installed.
```shell
npm install -g upptalk
```

## Usage
```shell
upptalk --help
```

## Examples

### Ping
```shell
upptalk  --apikey=APIKEY ping
```
### Get groups
```shell
upptalk --auth=USERNAME:PASSWORD --apikey=APIKEY groups
```
### Get user profile
```shell
upptalk --auth=USERNAME:PASSWORD --apikey=APIKEY profile USER
```
### Send chat message
```shell
upptalk --auth=USERNAME:PASSWORD --apikey=APIKEY chat '{"user": "USER", "text": "hello"}'
```