var mainloop = require('main-loop');
var h = require('virtual-dom/h');

var EventEmitter = require('events').EventEmitter;
var url = require('url');

var level = require('level-browserify');
var db = level('wiki.db');
var wiki = require('wikidb')(db);

var bus = new EventEmitter;
var router = require('../routes')(wiki, bus);

var catcher = require('catch-links');
catcher(window, function (href) {
    bus.emit('go', url.parse(href).pathname);
});

var layout = require('../lib/layout.js');
var initState = { href: location.pathname, page: h('div') };
var loop = mainloop(initState, layout, {
    create: require('virtual-dom/create-element'),
    diff: require('virtual-dom/diff'),
    patch: require('virtual-dom/patch')
});
document.querySelector('#content').appendChild(loop.target);

var singlePage = require('single-page');
var go = singlePage(function (href) {
    var m = router.match(href);
    if (!m) return console.error('404');
    
    m.partial = true;
    m.fn(m, function (page) {
        loop.update({ page: page, route: m.route, href: href });
    });
});
bus.on('go', go);

require('../routes')(wiki, bus);
bus.emit('go', location.pathname + (location.search || ''));
