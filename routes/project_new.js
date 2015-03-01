var h = require('virtual-dom/h');
var create = require('virtual-dom/create-element');
var through = require('through2');

module.exports = function (page, bus, wiki) {
    page.querySelector('form').addEventListener('submit', onsubmit);
    function onsubmit (ev) {
        ev.preventDefault();
        
        var opts = {
            key: this.elements.name.value,
            tags: [ 'project' ]
        };
        var w = wiki.createWriteStream(opts, function () {
            bus.emit('go', '/project/' + encodeURIComponent(w.key));
        });
        w.end(this.elements.description.value);
    }
    return function (m) {};
};
