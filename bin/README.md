# yuilop.js command line tool

## Description
Work in progress.

yuilop command line tool client

## Usage
```shell
./bin/yuilop (username:password) method (key=value key=value)
```

## Examples

#### No authentication

##### Ping
```shell
./bin/yuilop ping
```
##### Captcha
```shell
./bin yuilop captcha
```
#### Authentication
```shell
./bin yuilop username:password groups
```
#### Get profile
```shell
./bin yuilop username:password profile
```
#### Set profile
```shell
./bin yuilop username:password profile fullname='John Doe' nickname='John' email="john@doe.com"
```