var through = require('through2');
var strftime = require('strftime');
var h = require('virtual-dom/h');
var timeago = require('timeago');

module.exports = function home (wiki) {
    return function (m, show) {
        var rows = [];
        show(render());
        wiki.recent().pipe(through.obj(write));
        
        function write (row, enc, next) {
            rows.push(row);
            show(render());
            next();
        }
        
        function render () {
            return h('div', [
                h('h2', 'shipboard'),
                h('div', rows.map(function (row) {
                    var href = '/task/' + row.meta.key;
                    return h('div.task', [
                        'anonymous updated ',
                        h('a', { href: href }, row.meta.key),
                        
                        h('div', [
                            '(' + timeago(new Date(row.meta.time)) + ')',
                            ' @ ' + strftime('%T', new Date(row.meta.time))
                        ])
                    ]);
                }))
            ]);
        }
    };
};
