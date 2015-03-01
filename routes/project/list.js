var h = require('virtual-dom/h');
var patch = require('virtual-dom/patch');
var diff = require('virtual-dom/diff');
var create = require('virtual-dom/create-element');

var through = require('through2');

module.exports = function (page, bus, wiki) {
    var tree, elem;
    var rows = {};
    
    return function (m) {
        listProjects();
    };
    
    function listProjects () {
        wiki.byTag('project').pipe(through.obj(write));
        
        function write (row, enc, next) {
            rows[row.key] = row;
            next();
            render();
        }
    }
    
    function render () {
        var ntree = h('div',
            Object.keys(rows).map(function (key) {
                return h('a', {
                    href: '/project/' + encodeURIComponent(key),
                    onclick: clicker
                }, key)
            })
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
        bus.emit('go', this.getAttribute('href'));
    }
};
