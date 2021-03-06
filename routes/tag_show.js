var h = require('virtual-dom/h');
var through = require('through2');
var gantt = require('gantt-chart');
var has = require('has');
var onerror = require('../lib/onerror.js');
var error = require('../lib/error.js');

module.exports = function (wiki) {
    return function (m, show) {
        if (m.partial) show(h('div', 'loading...'));
        
        var g = gantt();
        onerror(wiki.byTag(m.params.name), show, error)
            .pipe(through.obj(write, end))
        ;
        
        function write (row, enc, next) {
            wiki.get(row.hash, function (err, meta) {
                meta.duration = '1 week';
                meta.dependencies = (meta.dependencies || [])
                    .filter(function (x) {
                        return /\S/.test(x) && x !== meta.key;
                    })
                ;
                meta.dependencies.forEach(function (dep) {
                    if (!has(g.tasks, dep)) {
                        g.add(dep, { duration: '1 week' });
                    }
                });
                
                g.add(meta.key, meta);
                if (m.partial) show(render());
            });
            next();
        }
        function end () {
            if (!m.partial) show(render());
        }
        
        function render () {
            return h('div', [
                h('h2', m.params.name),
                g.tree()
            ]);
        }
    }
};
