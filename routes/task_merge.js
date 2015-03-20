var through = require('through2');
var h = require('virtual-dom/h');
var uniq = require('uniq');
var onerror = require('../lib/onerror.js');
var error = require('../lib/error.js');

var merge = require('../lib/merge.js');

module.exports = function (wiki, bus) {
    return function (m, show) { return edit(wiki, bus, m, show) };
};

function edit (wiki, bus, m, show) {
    var meta = {};
    var desc = '';
    
    var titleName = '';
    var editingTitle = false;
    function setTitleEdit (v) {
        editingTitle = v;
        show(render());
    }
    function showTitleEdit () { setTitleEdit(true) }
    function hideTitleEdit () { setTitleEdit(false) }
    
    if (m.partial) show(render());
    
    var hashes = (m.params.hash || '').split(',');
    merge(wiki, hashes, function (err, meta_, text) {
        meta = meta_;
        desc = text.map(function (c) {
            if (typeof c === 'string') return c;
            if (typeof c === 'object' && c['?']) {
                return '(((' + c['?'].map(function (x) {
                    return x.join('')
                }).join('|||') + ')))';
            }
        }).join('');
        show(render());
    });
    
    function render () {
        var input = h('input', {
            type: editingTitle ? 'text' : 'hidden',
            name: 'name',
            value: titleName,
            onblur: hideTitleEdit,
            onchange: function () { titleName = this.value },
            onkeydown: function () { titleName = this.value }
        });
        var title = h('h3', [
            input,
            editingTitle ? '' : h('div', { onclick: showTitleEdit }, titleName)
        ]);
        
        return h('div', [
            h('h2', 'merge task'),
            h('form', { onsubmit: onsubmit }, [
                h('div.right', [
                    h('button', { onclick: onremove }, 'remove'),
                ]),
                title,
                h('input', {
                    type: 'text',
                    name: 'duration',
                    value: meta.duration || '',
                    placeholder: 'duration'
                }),
                h('div', h('textarea', {
                    name: 'description',
                    placeholder: 'description'
                }, desc)),
                h('h3', 'dependencies'),
                h('textarea',
                    {
                        name: 'dependencies', 
                        placeholder: 'dependencies (one per line)'
                    },
                    (meta.dependencies || []).join('\n')
                ),
                h('h3', 'tags'),
                h('textarea',
                    {
                        name: 'tags', 
                        placeholder: 'tags (one per line)'
                    },
                    (meta.tags || []).filter(not('task')).join('\n')
                ),
                h('button', { type: 'submit' }, 'submit')
            ])
        ]);
    }
    
    function onsubmit (ev) {
        ev.preventDefault();
        key = meta.key;
        var deps = this.elements.dependencies.value.split(/\n/)
            .map(function (line) { return line.trim() })
            .filter(function (x) { return /\S/.test(x) })
        ;
        var tags = this.elements.tags.value.split(/\n/)
            .map(function (line) { return line.trim() })
            .filter(function (x) { return /\S/.test(x) })
        ;
        var opts = {
            key: meta.key,
            duration: this.elements.duration.value,
            dependencies: deps,
            prev: hashes,
            tags: uniq([ 'task' ].concat(tags))
        };
        var w = wiki.createWriteStream(opts, function () {
            bus.emit('go', '/task/' + encodeURIComponent(meta.key));
        });
        w.end(this.elements.description.value);
    }
    
    function onremove (ev) {
        ev.preventDefault();
        
        var opts = {
            key: key,
            dependencies: {},
            prev: m.params.hash,
            tags: []
        };
        var w = wiki.createWriteStream(opts, function () {
            bus.emit('go', '/tasks');
        });
        w.end('');
    }
};

function not (x) {
    return function (y) { return x !== y };
}
