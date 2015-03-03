var h = require('virtual-dom/h');
var concat = require('concat-stream');

module.exports = function (page, bus, wiki) {
    return function (m) {
        wiki.createReadStream(m.params.hash).pipe(concat(function (body) {
            form.elements.description.value = body.toString();
        }));
        wiki.get(m.params.hash, function (err, rec) {
            form.elements.name.value = rec.key;
        });
        
        var form = page.querySelector('form');
        form.addEventListener('submit', onsubmit);
        
        function onsubmit (ev) {
            ev.preventDefault();
            
            var opts = {
                key: form.elements.name.value,
                prev: m.params.hash,
                tags: [ 'task' ]
            };
            var w = wiki.createWriteStream(opts, function () {
                bus.emit('go', '/task/' + encodeURIComponent(opts.key));
            });
            w.end(this.elements.description.value);
        }
    };
};
