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
        var pending = 0;
        
        if (/^[0-9a-f]{64}$/.test(m.params.name)) {
            pending ++;
            return onerror(wiki.createReadStream(m.params.name), show, error)
                .pipe(save(m.params.name))
            ;
        }
        
        wiki.heads(m.params.name, function (err, heads) {
            if (err) return show(error(err))
            if (heads.length === 0) {
                return show(error('404 task not found', 404));
            }
            heads.forEach(function (h) {
                pending ++;
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
                if (m.partial) saveChunks(function () {
                    show(render(body));
                    next();
                });
                else next();
            }
            function end () {
                if (!m.partial) {
                    saveChunks(function () {
                        if (--pending === 0) show(render(body));
                    });
                }
            }
            function saveChunks (next) {
                var mstr = marked(Buffer.concat(chunks[hash]).toString());
                vhtml('<div>' + mstr + '</div>\n', function (err, dom) {
                    if (err) return show(error(err));
                    body[hash] = dom;
                    next();
                });
            }
        }
    }
    
    function render (body) {
        var hashes = Object.keys(body);
        var merge = h('div.bottom-buttons', [
            h('div.merge-buttons.right', [
                h('button', 'merge'),
                h('button', 'select all')
            ])
        ]);
        
        return h('div#show-task', [
            h('h2', 'task'),
            hashes.map(function (hash) {
                var href = '/task/'
                    + encodeURIComponent(hash)
                    + '/edit'
                ;
                return h('div.task', [
                    h('div.right.buttons', [
                        h('a', { href: href }, [
                            h('button', 'edit')
                        ]),
                        hashes.length > 1
                            ? h('input', { type: 'checkbox' })
                            : ''
                    ]),
                    h('div.hash', h('a', {
                        href: '/task/' + hash
                    }, hash.slice(0,20))),
                    body[hash],
                    hashes.length > 1 ? h('hr') : ''
                ]);
            }),
            hashes.length > 1 ? merge : ''
        ]);
    }
};
