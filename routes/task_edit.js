var through = require('through2');
var h = require('virtual-dom/h');

module.exports = function (wiki, bus) {
    return function (m, show) { return edit(wiki, bus, m, show) };
};

function edit (wiki, bus, m, show) {
    var chunks = [], key = '', deps = [];
    show(render());
    
    wiki.get(m.params.hash, function (err, rec) {
        key = rec.key;
        deps = rec.dependencies || [];
    });
    wiki.createReadStream(m.params.hash).pipe(through(write))
    
    function write (buf, enc, next) {
        chunks.push(buf);
        show(render());
        next();
    }
    
    function render () {
        return h('div', [
            h('h2', 'edit task'),
            h('h3', key),
            h('form', { onsubmit: onsubmit }, [
                h('div.line', [
                    h('input', {
                        type: 'text',
                        name: 'name',
                        value: key
                    })
                ]),
                h('textarea',
                    { name: 'description' },
                    Buffer.concat(chunks).toString()
                ),
                h('textarea',
                    {
                        name: 'dependencies', 
                        placeholder: 'dependencies (one per line)'
                    },
                    deps.join('\n')
                ),
                h('button', { type: 'submit' }, 'submit')
            ])
        ]);
    }
    
    function onsubmit (ev) {
        ev.preventDefault();
        key = this.elements.name.value;
        var deps = this.elements.dependencies.value.split(/\n/)
            .map(function (line) { return line.trim() })
            .filter(Boolean)
        ;
        var opts = {
            key: key,
            dependencies: deps,
            prev: m.params.hash,
            tags: [ 'task' ]
        };
        var w = wiki.createWriteStream(opts, function () {
            bus.emit('go', '/task/' + encodeURIComponent(key));
        });
        w.end(this.elements.description.value);
    }
};
