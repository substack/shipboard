var h = require('virtual-dom/h');
var through = require('through2');
var vhtml = require('virtual-html');
var marked = require('marked');
var onerror = require('../lib/onerror.js');
var error = require('../lib/error.js');

module.exports = function (wiki) {
    return function (m, show) {
        if (m.partial) show(h('div', 'loading...'));
        var chunks = {};
        var body = {};
        
        wiki.heads(m.params.name, function (err, heads) {
            if (err) return show(error(err))
            if (heads.length === 0) {
                return show(error('404 task not found', 404));
            }
            
            heads.forEach(function (h) {
                onerror(wiki.createReadStream(h.hash), show, error)
                    .pipe(save(h.hash))
                ;
            });
            var hashes = heads.sort().map(function (h) { return h.hash });
            if (m.partial) show(render(body));
        });
        
        function save (hash) {
            chunks[hash] = [];
            return through(write, end);
            function write (buf, enc, next) {
                chunks[hash].push(buf);
                if (m.partial) showChunks(next);
                else next();
            }
            function end () {
                if (!m.partial) showChunks();
            }
            function showChunks (next) {
                var mstr = marked(Buffer.concat(chunks[hash]).toString());
                vhtml('<div>' + mstr + '</div>\n', function (err, dom) {
                    if (err) return show(error(err));
                    body[hash] = dom;
                    show(render(body));
                    if (next) next();
                });
            }
        }
    }
    
    function render (body) {
        var hashes = Object.keys(body);
        var href = '/task/'
            + encodeURIComponent(hashes.join(','))
            + '/edit'
        ;
        return h('div', [
            h('h2', 'task'),
            h('div.right.buttons', [
                h('a', { href: href }, [
                    h('button', 'edit')
                ])
            ]),
            Object.keys(body).map(function (key) {
                return h('div', [ body[key], h('hr') ]);
            })
        ]);
    }
};
