var h = require('virtual-dom/h');

module.exports = function (state) {
    var names = {
        '/': 'activity',
        '/tasks': 'tasks',
        '/tags': 'tags'
    };
    var links = [ '/', '/tasks', '/tags' ].map(function (href) {
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
};
