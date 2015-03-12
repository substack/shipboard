var h = require('virtual-dom/h');
var uniq = require('uniq');

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
                h('input', {
                    type: 'text',
                    name: 'duration',
                    value: '1 week'
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
                h('textarea', {
                    name: 'tags',
                    placeholder: 'tags (one per line)'
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
            .filter(function (x) { return /\S/.test(x) })
        ;
        var tags = this.elements.tags.value.split(/\n/)
            .map(function (line) { return line.trim() })
            .filter(function (x) { return /\S/.test(x) })
        ;
        var opts = {
            key: key,
            duration: this.elements.duration.value,
            dependencies: deps,
            prev: m.params.hash,
            tags: uniq([ 'task' ].concat(tags))
        };
        var w = wiki.createWriteStream(opts, function () {
            bus.emit('go', '/task/' + encodeURIComponent(key));
        });
        w.end(this.elements.description.value);
    }
}
