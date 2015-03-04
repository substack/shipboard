var mainloop = require('main-loop');
var h = require('virtual-dom/h');
var vhtml = require('virtual-html');

var through = require('through2');
var marked = require('marked');

var EventEmitter = require('events').EventEmitter;
var url = require('url');

var level = require('level-browserify');
var db = level('wiki.db');
var wiki = require('wikidb')(db);

var bus = new EventEmitter;
window.addEventListener('click', function (ev) {
    if (ev.target.tagName !== 'a') return;
    var u = url.parse(ev.target.getAttribute('href'));
    if (u.host && u.host !== location.host) return;
    ev.preventDefault();
    bus.emit('go', ev.target.getAttribute('href'));
});

var initState = { href: location.pathname, page: h('div') };
var loop = mainloop(initState, render, {
    create: require('virtual-dom/create-element'),
    diff: require('virtual-dom/diff'),
    patch: require('virtual-dom/patch')
});
document.body.appendChild(loop.target);

function render (state) {
    var names = { '/': 'activity', '/tasks': 'tasks' };
    var links = [ '/', '/tasks' ].map(function (href) {
        return h('a', {
            href: href,
            className: state.route === href ? 'active' : ''
        }, names[href])
    });
    return h('div', [
        h('div#header', [
            h('h1', [ h('a', { href: '/' }, 'shipboard') ]),
            h('div.pages', links),
        ]),
        h('div#page', state.page)
    ]);
}

var singlePage = require('single-page');
var go = singlePage(function (href) {
    var m = router.match(href);
    if (!m) return console.error('404');
    
    m.fn(m, function (page) {
        loop.update({
            page: page,
            route: m.route,
            href: href
        });
    });
});
bus.on('go', go);

var router = require('routes')();

router.addRoute('/', function (m, show) {
    var rows = [];
    render();
    wiki.recent().pipe(through.obj(write));
    
    function write (row, enc, next) {
        rows.push(row);
        render();
        next();
    }
    
    function render () {
        show(h('div', [
            h('h2', 'activity'),
            h('div', rows.map(function (row) {
                return h('div', row.hash);
            }))
        ]));
    }
});

router.addRoute('/tasks', function (m, show) {
    var rows = {};
    render();
    wiki.byTag('task').pipe(through.obj(write));
    
    function write (row, enc, next) {
        rows[row.key] = row;
        render();
        next();
    }
    
    function render () {
        show(h('div', [
            h('h2', 'tasks'),
            h('div.right.buttons', [
                h('a', { href: '/tasks/new' }, [
                    h('button', 'new task')
                ])
            ]),
            h('div', Object.keys(rows).map(function (key) {
                return h('div', [
                    h('a', { href: '/task/' + encodeURIComponent(key) }, key)
                ]);
            }))
        ]));
    }
});

router.addRoute('/tasks/new', function (m, show) {
    show(h('div', [
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
    ]));
    
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
});

router.addRoute('/task/:name', function (m, show) {
    show(h('div', 'loading...'));
    var chunks = [], hash = '';
    var body = h('div');
    
    wiki.heads(m.params.name, function (err, heads) {
        hash = heads[0].hash; // for now...
        render();
        wiki.createReadStream(hash).pipe(through(write));
    });
    function write (buf, enc, next) {
        chunks.push(buf);
        vhtml(marked(Buffer.concat(chunks).toString()), function (err, dom) {
            body = dom;
            render();
            next();
        });
    }
    
    function render () {
        show(h('div', [
            h('h2', 'task'),
            h('div.right.buttons', [
                h('a',
                    { href: '/task/' + encodeURIComponent(hash) + '/edit' },
                    [ h('button', 'edit') ]
                )
            ]),
            body
        ]));
    }
});

router.addRoute('/task/:hash/edit', function (m, show) {
    var chunks = [], key = '', deps = [];
    render();
    
    wiki.get(m.params.hash, function (err, rec) {
        key = rec.key;
        deps = rec.dependencies || [];
    });
    wiki.createReadStream(m.params.hash).pipe(through(write))
    
    function write (buf, enc, next) {
        chunks.push(buf);
        render();
        next();
    }
    
    function render () {
        show(h('div', [
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
        ]));
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
});

bus.emit('go', location.pathname + (location.search || ''));
