# UppTalk.js command line tool

## Description
Work in progress.

UppTalk command line tool client

## Usage
```shell
./bin/upptalk (username:password) method (key=value key=value)
```

## Examples

#### No authentication, no payload
```shell
./bin/upptalk captcha
```
#### Authentication, no payload
```shell
./bin upptalk username:password profile
```
#### Authentication, payload
```shell
./bin upptalk username:password profile fullname='John Doe' nickname='John' email="john@doe.com"
```