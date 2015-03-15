var through = require('through2');
var h = require('virtual-dom/h');
var onerror = require('../lib/onerror.js');

module.exports = function home (wiki) {
    return function (m, show) {
        var rows = [];
        if (m.partial) show(render());
        onerror(wiki.recent(), show, error)
            .pipe(through.obj(write, end));
        
        function write (row, enc, next) {
            rows.push(row);
            if (m.partial) show(render());
            next();
        }
        function end () {
            if (!m.partial) show(render());
        }
        
        function render () {
            return h('div', [
                h('h2', 'activity'),
                h('div', rows.map(function (row) {
                    return h('div', row.hash);
                }))
            ]);
        }
    };
};
