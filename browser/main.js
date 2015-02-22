var create = require('virtual-dom/create-element');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');

var gantt = require('gantt-chart');

var g = gantt({
    wow: {
        duration: '1 week'
    },
    cool: {
        duration: '3 days',
        dependencies: [ 'wow' ]
    }
});

var elem = document.querySelector('#chart');
elem.appendChild(create(g.tree()));
