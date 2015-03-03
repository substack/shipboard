module.exports = function (page, bus, wiki) {
    page.querySelector('form').addEventListener('submit', onsubmit);
    function onsubmit (ev) {
        ev.preventDefault();
        
        var deps = this.elements.dependencies.value.split('\n')
            .map(function (s) { return s.trim() })
            .filter(Boolean)
        ;
        var opts = {
            key: this.elements.name.value,
            tags: [ 'task' ],
            dependencies: deps
        };
        var w = wiki.createWriteStream(opts, function () {
            bus.emit('go', '/task/' + encodeURIComponent(opts.key));
        });
        w.end(this.elements.description.value);
    }
    return function (m) {};
};
