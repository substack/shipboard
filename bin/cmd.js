#!/usr/bin/env node

var http = require('http');
var handle = require('../');

var server = http.createServer(handle);
server.listen(8080);
