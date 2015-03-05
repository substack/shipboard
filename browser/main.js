var mainloop = require('main-loop');
var h = require('virtual-dom/h');

var EventEmitter = require('events').EventEmitter;
var url = require('url');

var level = require('level-browserify');
var db = level('wiki.db');
var wiki = require('wikidb')(db);

var bus = new EventEmitter;

var catcher = require('catch-links');
catcher(window, function (href) {
    bus.emit('go', url.parse(href).pathname);
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
        loop.update({ page: page, route: m.route, href: href });
    });
});
bus.on('go', go);

var router = require('routes')();
router.addRoute('/', require('../routes/home.js')(wiki));
router.addRoute('/tasks', require('../routes/task_list.js')(wiki));
router.addRoute('/tasks/new', require('../routes/task_new.js')(wiki));
router.addRoute('/task/:name', require('../routes/task_show.js')(wiki));
router.addRoute('/task/:hash/edit',
    require('../routes/task_edit.js')(wiki, bus)
);
bus.emit('go', location.pathname + (location.search || ''));
