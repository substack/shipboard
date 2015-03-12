var h = require('virtual-dom/h');
var through = require('through2');
var gantt = require('gantt-chart');
var has = require('has');

module.exports = function (wiki) {
    return function (m, show) {
        show(h('div', 'loading...'));
        
        var g = gantt();
        wiki.byTag(m.params.name).pipe(through.obj(write));
        
        function write (row, enc, next) {
            wiki.get(row.hash, function (err, meta) {
                meta.duration = '1 week';
                meta.dependencies = (meta.dependencies || [])
                    .filter(function (x) { return /\S/.test(x) })
                ;
                meta.dependencies.forEach(function (dep) {
                    if (!has(g.tasks, dep)) {
                        g.add(dep, { duration: '1 week' });
                    }
                });
                
                g.add(meta.key, meta);
                show(render());
            });
            next();
        }
        function render () {
            return h('div', [
                h('h2', m.params.name),
                g.tree()
            ]);
        }
    }
};
