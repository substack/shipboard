var h = require('virtual-dom/h');
var through = require('through2');

module.exports = function taskList (wiki) {
    return function (m, show) {
        var rows = {};
        show(render(rows));
        wiki.byTag('task').pipe(through.obj(write));
        
        function write (row, enc, next) {
            rows[row.key] = row;
            show(render(rows));
            next();
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
