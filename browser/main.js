var h = require('virtual-hyperscript');
var create = require('virtual-dom/create-element');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');

var url = require('url');
var gantt = require('gantt-chart');
var router = require('routes')();
var classList = require('class-list');

router.addRoute('/', function () {
});

router.addRoute('/tasks', function () {
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
    return function (p) {
        if (!page) {
            page = p;
            page.appendChild(create(g.tree()));
        }
    };
})());

router.addRoute('/projects', (function () {
    var tree;
    return function (page) {
        if (tree) return;
        tree = h('div',
            h('a', {
                href: '/projects/cool',
                onclick: clicker
            }, 'cool')
        );
        page.appendChild(create(tree));
    };
    function clicker (ev) {
        ev.preventDefault();
        go(this.getAttribute('href'));
    }
})());

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

var linkElems = document.querySelectorAll('a[href]');
var links = {};
for (var i = 0; i < linkElems.length; i++) (function (link) {
    links[link.getAttribute('href')] = link;
    link.addEventListener('click', function (ev) {
        ev.preventDefault();
        go(link.getAttribute('href'));
    });
})(linkElems[i]);

var pageElems = document.querySelectorAll('[page]');
var pages = {};
for (var i = 0; i < pageElems.length; i++) {
    pages[pageElems[i].getAttribute('page')] = pageElems[i];
}

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
    if (pages[u.pathname]) {
        pages[u.pathname].style.display = 'block';
    }
    if (m) m.fn(pages[u.pathname]);
    prev = u.pathname;
});
go(location.href);
