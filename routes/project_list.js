var h = require('virtual-dom/h');
var create = require('virtual-dom/create-element');
var through = require('through2');

module.exports = function (page, bus, wiki) {
    var tree, elem;
    var rows = {};
    
    page.querySelector('form').addEventListener('submit', onsubmit);
    function onsubmit (ev) {
        ev.preventDefault();
        console.log('create and append tagged doc here...');
        
        render();
    }
    
    return function (m) {
        wiki.byTag('project').pipe(through(write));
        
        function write (row, enc, next) {
            rows[row.key] = row;
            next();
            render();
        }
        
        function render () {
            var ntree = h('div',
                h('a', {
                    href: '/project/cool',
                    onclick: clicker
                }, 'cool')
            );
            if (tree) {
                elem = patch(elem, diff(tree, ntree));
            }
            else {
                elem = create(ntree);
                page.appendChild(elem);
            }
            tree = ntree;
        }
        
        function clicker (ev) {
            ev.preventDefault();
            m.bus.emit('go', this.getAttribute('href'));
        }
    };
};
