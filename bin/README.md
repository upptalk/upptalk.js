# yuilop.js command line tool

## Description
Work in progress.

yuilop command line tool client

## Usage
```shell
./bin/yuilop (username:password) method (key=value key=value)
```

## Examples

#### No authentication, no payload
```shell
./bin/yuilop captcha
```
#### Authentication, no payload
```shell
./bin yuilop username:password profile
```
#### Authentication, payload
```shell
./bin yuilop username:password profile fullname='John Doe' nickname='John' email="john@doe.com"
```