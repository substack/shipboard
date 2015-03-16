var through = require('through2');
var h = require('virtual-dom/h');
var onerror = require('../lib/onerror.js');
var url = require('url');
var wsock = require('websocket-stream');

module.exports = function (wiki) {
    return function (m, show) { handle(wiki, m, show) };
};

function handle (wiki, m, show) {
    var logs = [];
    function log (msg) {
        logs.push(msg);
        show(render());
    }
    show(render());
    
    function render () {
        var defaultEndpoint = typeof location !== 'undefined'
            ? location.protocol + '//' + location.host
            : ''
        ;
        return h('div#sync', [
            h('h2', 'sync'),
            h('form',  { onsubmit: onsubmit }, [
                h('div.line', [
                    'push, pull, or sync all documents '
                    + 'with a shipboard endpoint'
                ]),
                h('div.line', [
                    h('input', {
                        name: 'url',
                        type: 'text',
                        placeholder: 'shipboard instance URL',
                        value: defaultEndpoint
                    })
                ]),
                h('div.line', [
                    h('button', { onclick: onclick('push') }, 'push'),
                    h('button', { onclick: onclick('pull') }, 'pull'),
                    h('button', { onclick: onclick('sync') }, 'sync')
                ]),
                h('div.info', logs.map(function (x) {
                    return h('div.line', x);
                }))
            ])
        ]);
    }
    
    function onsubmit (ev) {
        ev.preventDefault();
    }
    
    function onclick (mode) {
        return function (ev) {
            var form = formOf(ev.target);
            var u = url.parse(form.elements.url.value);
            if (!u.host) {
                u = location.protocol + '://'
                    + url.parse(form.elements.url.value)
                ;
            }
            var whref = 'ws://' + u.host + '/' + mode;
            logs.splice(0);
            log('replication mode ' + mode);
            log('connecting to ' + whref);
            
            var ws = wsock(whref);
            ws.once('connect', function () {
                log('connected to ' + whref);
            });
            ws.once('end', function () {
                log('disconnected from ' + whref);
            });
            
            var sync = wiki.replicate({ mode: mode });
            sync.on('available', function (hashes) {
                log(hashes.length + ' available documents');
            });
            sync.on('response', function (hash, stream) {
                log('downloading ' + hash);
                stream.once('end', function () {
                    log('download of ' + hash + ' complete');
                });
            });
            sync.on('since', function (seq) {
                log('since sequence ' + seq);
            });
            sync.on('sync', function (hashes) {
                log('exchanged ' + hashes.length + ' documents');
            });
            ws.pipe(sync).pipe(ws);
        };
    }
};

function formOf (node) {
    for (; node = node.parentNode; node.parentNode) {
        if (node.tagName.toUpperCase() === 'FORM') return node;
    }
}
