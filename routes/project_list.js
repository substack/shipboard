var h = require('virtual-dom/h');
var create = require('virtual-dom/create-element');
var tree;

module.exports = function (m) {
    if (tree) return;
    tree = h('div',
        h('a', {
            href: '/project/cool',
            onclick: clicker
        }, 'cool')
    );
    m.page.appendChild(create(tree));
    
    function clicker (ev) {
        ev.preventDefault();
        m.bus.emit('go', this.getAttribute('href'));
    }
};
