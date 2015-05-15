var through = require('through2');
var strftime = require('strftime');
var h = require('virtual-dom/h');
var timeago = require('timeago');
var onerror = require('../lib/onerror.js');
var error = require('../lib/error.js');

module.exports = function home (wiki) {
    return function (m, show) {
        var rows = [];
        if (m.partial) show(render());
        var count = 0;
        onerror(wiki.recent(), show, error)
            .pipe(through.obj(write, end))
        ;
        
        function write (row, enc, next) {
            rows.push(row);
            if (m.partial) show(render());
            next();
        }
        function end () {
            if (!m.partial) show(render());
        }
        
        function render () {
            return h('div#home', [
                h('h2', 'shipboard'),
                h('div', rows.map(function (row) {
                    var href = '/task/' + row.meta.key;
                    var d = new Date(row.meta.time);
                    var ymd = strftime('%Y-%m-%d', d);
                    var time = strftime('%T', d);
                    var ago = timeago(new Date(row.meta.time));
                    
                    return h('div.task', [
                        'anonymous updated ',
                        h('a', { href: href }, row.meta.key),
                        
                        h('div.when', [
                            h('span.ago', ago),
                            ' @ (',
                            h('span.ymd', ymd),
                            h('span.T', ' T '),
                            h('span.time', time),
                            ')'
                        ])
                    ]);
                }))
            ]);
        }
    };
};
