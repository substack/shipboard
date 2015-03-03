#!/usr/bin/env node

var http = require('http');
var handle = require('../');
var minimist = require('minimist');
var argv = minimist(process.argv.slice(2), {
    alias: { p: 'port' },
    default: { port: 8080 }
});

var server = http.createServer(handle);
server.listen(argv.port, function () {
    console.log('listening on :'  + server.address().port);
});
