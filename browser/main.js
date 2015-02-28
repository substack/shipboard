var create = require('virtual-dom/create-element');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');

var url = require('url');
var gantt = require('gantt-chart');
var router = require('routes')();

router.addRoute('/', function () {
});

router.addRoute('/create', function () {
});

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

var links = document.querySelectorAll('a[href]');
for (var i = 0; i < links.length; i++) (function (link) {
    link.addEventListener('click', function (ev) {
        ev.preventDefault();
        go(link.getAttribute('href'));
    });
})(links[i]);

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
    if (prev) prev.style.display = 'none';
    if (m) {
        prev = pages[u.pathname];
        if (prev) prev.style.display = 'block';
        m.fn(prev);
    }
});
go(location.href);
