var create = require('virtual-dom/create-element');

var EventEmitter = require('events').EventEmitter;
var url = require('url');
var gantt = require('gantt-chart');
var classList = require('class-list');

var level = require('level-browserify');
var sublevel = require('subleveldown');
var db = level('wiki.db');
var wiki = require('wikidb')(sublevel(db, 'wiki'));

var linkElems = document.querySelectorAll('a[href]');
var links = {};
for (var i = 0; i < linkElems.length; i++) (function (link) {
    links[link.getAttribute('href')] = link;
    link.addEventListener('click', function (ev) {
        ev.preventDefault();
        bus.emit('go', link.getAttribute('href'));
    });
})(linkElems[i]);

var pageElems = document.querySelectorAll('[page]');
var pages = {};
for (var i = 0; i < pageElems.length; i++) {
    pages[pageElems[i].getAttribute('page')] = pageElems[i];
}

var bus = new EventEmitter;
var router = require('routes')();

router.addRoute('/', function () {
});

router.addRoute('/project/:name', (function () {
    var g = gantt({
        wow: {
            duration: '1 week'
        },
        cool: {
            duration: '3 days',
            dependencies: [ 'wow' ]
        }
    });
    var page;
    return function (m) {
        if (!page) {
            page = m.page;
            page.appendChild(create(g.tree()));
        }
    };
})());

router.addRoute('/projects', require('../routes/project/list.js')(
    pages['/projects'], bus, wiki
));
router.addRoute('/projects/new', require('../routes/project/new.js')(
    pages['/projects/new'], bus, wiki
));

router.addRoute('/tasks', require('../routes/task/list.js')(
    pages['/tasks'], bus, wiki
));
router.addRoute('/tasks/new', require('../routes/task/new.js')(
    pages['/tasks/new'], bus, wiki
));
router.addRoute('/task/:hash/edit', require('../routes/task/edit.js')(
    pages['/task/:hash/edit'], bus, wiki
));
router.addRoute('/task/:name', require('../routes/task/show.js')(
    pages['/task/:name'], bus, wiki
));

router.addRoute('/view', (function () {
    var g = gantt({
        wow: {
            duration: '1 week'
        },
        cool: {
            duration: '3 days',
            dependencies: [ 'wow' ]
        }
    });
    var page;
    return function (p) {
        if (!page) {
            page = p;
            page.appendChild(create(g.tree()));
        }
    };
})());

router.addRoute('/edit', function () {
});

var singlePage = require('single-page');
var prev;
var go = singlePage(function (href) {
    var u = url.parse(href);
    if (u.host && u.host !== location.host) {
        location.href = href;
        return;
    }
    var m = router.match(u.pathname + (u.search || ''));
    if (pages[prev]) {
        pages[prev].style.display = 'none';
    }
    if (links[prev]) {
        classList(links[prev]).remove('active');
    }
    if (links[u.pathname]) {
        classList(links[u.pathname]).add('active');
    }
    if (m && pages[m.route]) {
        pages[m.route].style.display = 'block';
    }
    if (m) {
        m.fn({
            params: m.params,
            route: m.route,
            page: pages[m.route]
        });
        prev = m.route;
    }
    else if (pages[u.pathname]) {
        pages[u.pathname].style.display = 'block';
        prev = u.pathname;
    }
    else prev = u.pathname;
});
bus.on('go', go);
bus.emit('go', location.href);
