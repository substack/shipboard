var h = require('virtual-dom/h');
var through = require('through2');

module.exports = function taskList (wiki) {
    return function (m, show) {
        var rows = {};
        if (m.partial) show(render(rows));
        wiki.tags().pipe(through.obj(write, end));
        
        function write (row, enc, next) {
            rows[row.tag] = row;
            if (m.partial) show(render(rows));
            next();
        }
        function end () {
            if (!m.partial) show(render(rows));
        }
    };
    
    function render (rows) {
        return h('div', [
            h('h2', 'tags'),
            h('div', Object.keys(rows).map(function (key) {
                if (key === 'task') return '';
                return h('div', [
                    h('a', {
                        href: '/tag/' + encodeURIComponent(key)
                    }, key)
                ]);
            }))
        ]);
    }
};
