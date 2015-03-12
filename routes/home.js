var through = require('through2');
var strftime = require('strftime');
var h = require('virtual-dom/h');
var timeago = require('timeago');

module.exports = function home (wiki) {
    return function (m, show) {
        var rows = [];
        show(render());
        var count = 0;
        wiki.recent().pipe(through.obj(write));
        
        function write (row, enc, next) {
            rows.push(row);
            show(render());
            if (++count < 10) next();
        }
        
        function render () {
            return h('div', [
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
