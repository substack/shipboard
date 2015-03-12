var through = require('through2');
var h = require('virtual-dom/h');

module.exports = function (wiki, bus) {
    return function (m, show) { return edit(wiki, bus, m, show) };
};

function edit (wiki, bus, m, show) {
    var chunks = [], key = '', deps = [];
    
    var titleName = '';
    var editingTitle = false;
    function setTitleEdit (v) {
        editingTitle = v;
        show(render());
    }
    function showTitleEdit () { setTitleEdit(true) }
    function hideTitleEdit () { setTitleEdit(false) }
    
    show(render());
    
    wiki.get(m.params.hash, function (err, rec) {
        key = rec.key;
        titleName = key;
        deps = rec.dependencies || [];
    });
    wiki.createReadStream(m.params.hash).pipe(through(write))
    
    function write (buf, enc, next) {
        chunks.push(buf);
        show(render());
        next();
    }
    
    function render () {
        var title = h('h3', [ editingTitle
            ? h('input', {
                type: 'text',
                name: 'name',
                value: titleName,
                onblur: hideTitleEdit,
                onchange: function () { titleName = this.value },
                onkeydown: function () { titleName = this.value }
            })
            : h('div', { onclick: showTitleEdit }, titleName)
        ]);
        return h('div', [
            h('h2', 'edit task'),
            h('form', { onsubmit: onsubmit }, [
                title,
                h('input', {
                    type: 'hidden',
                    name: 'prevName',
                    value: key,
                }),
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
