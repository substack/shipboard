var h = require('virtual-dom/h');
var through = require('through2');
var error = require('../lib/error.js');
var onerror = require('../lib/onerror.js');

module.exports = function taskList (wiki) {
    return function (m, show) {
        var rows = {};
        if (m.partial) show(render(rows));
        
        onerror(wiki.byTag('task'), show, error)
            .pipe(through.obj(write, end))
        ;
        
        function write (row, enc, next) {
            rows[row.key] = row;
            if (m.partial) show(render(rows));
            next();
        }
        function end () {
            if (!m.partial) show(render(rows));
        }
    };
    
    function render (rows) {
        return h('div', [
            h('h2', 'tasks'),
            h('div.right.buttons', [
                h('a', { href: '/tasks/new' }, [
                    h('button', 'new task')
                ])
            ]),
            h('div', Object.keys(rows).map(function (key) {
                return h('div', [
                    h('a', {
                        href: '/task/' + encodeURIComponent(key)
                    }, key)
                ]);
            }))
        ]);
    }
};
