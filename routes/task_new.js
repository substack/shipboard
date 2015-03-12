var h = require('virtual-dom/h');

module.exports = function newTask (wiki, bus) {
    return function (m, show) {
        show(render(wiki, m, bus));
    };
};

function render (wiki, m, bus) {
    return h('div', [
        h('h2', 'tasks'),
        h('form', { onsubmit: onsubmit }, [
            h('h3', 'new task'),
            h('div.line', [
                h('input', {
                    type: 'text',
                    name: 'name',
                    placeholder: 'task name'
                })
            ]),
            h('div.line', [
                h('textarea', {
                    name: 'description',
                    placeholder: 'task description'
                })
            ]),
            h('div.line', [
                h('textarea', {
                    name: 'dependencies',
                    placeholder: 'task dependencies (one per line)'
                })
            ]),
            h('div.line', [
                h('button', { type: 'submit' }, 'create')
            ])
        ])
    ]);
    
    function onsubmit (ev) {
        ev.preventDefault();
        var key = this.elements.name.value;
        var deps = this.elements.dependencies.value.split(/\n/)
            .map(function (line) { return line.trim() })
            .filter(Boolean)
        ;
        var opts = {
            key: key,
            prev: m.params.hash,
            dependencies: deps,
            tags: [ 'task' ]
        };
        var w = wiki.createWriteStream(opts, function () {
            bus.emit('go', '/task/' + encodeURIComponent(key));
        });
        w.end(this.elements.description.value);
    }
}
