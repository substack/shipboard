#!/usr/bin/env node

var http = require('http');
var path = require('path');
var EventEmitter = require('events').EventEmitter;
var handle = require('../');
var minimist = require('minimist');
var argv = minimist(process.argv.slice(2), {
    alias: { p: 'port', d: [ 'dir', 'datadir' ] },
    default: { port: 8080, datadir: './shipboard-data' }
});
var level = require('level');
var mkdirp = require('mkdirp');

mkdirp.sync(argv.datadir);
var db = level(path.join(argv.datadir, 'db'));
var wikidb = require('wikidb');
var wiki = wikidb(db, { dir: path.join(argv.datadir, 'store') });
var bus = new EventEmitter;

var server = http.createServer(handle(wiki, bus));
server.listen(argv.port, function () {
    console.log('listening on :'  + server.address().port);
});

var websocket = require('websocket-stream');
var wsock = websocket.createServer({ server: server }, whandle);
function whandle (stream) {
    stream.pipe(wiki.replicate()).pipe(stream);
}
