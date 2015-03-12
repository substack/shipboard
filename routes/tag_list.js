var h = require('virtual-dom/h');
var through = require('through2');

module.exports = function taskList (wiki) {
    return function (m, show) {
        var rows = {};
        show(render(rows));
        wiki.tags().pipe(through.obj(write));
        
        function write (row, enc, next) {
            rows[row.tag] = row;
            show(render(rows));
            next();
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
