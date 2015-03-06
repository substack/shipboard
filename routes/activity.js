var through = require('through2');
var h = require('virtual-dom/h');

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
                h('h2', 'activity'),
                h('div', rows.map(function (row) {
                    return h('div', row.hash);
                }))
            ]);
        }
    };
};
