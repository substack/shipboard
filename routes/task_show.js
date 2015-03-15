var h = require('virtual-dom/h');
var through = require('through2');
var vhtml = require('virtual-html');
var marked = require('marked');
var onerror = require('../lib/onerror.js');
var error = require('../lib/error.js');

module.exports = function (wiki) {
    return function (m, show) {
        if (m.partial) show(h('div', 'loading...'));
        var chunks = [], hash = '';
        var body = h('div');
        
        wiki.heads(m.params.name, function (err, heads) {
            if (err) return show(error(err))
            if (heads.length === 0) {
                return show(error('404 task not found', 404));
            }
            
            hash = heads[0].hash; // for now...
            if (m.partial) show(render(body, hash));
            onerror(wiki.createReadStream(hash), show, error)
                .pipe(through(write, end))
            ;
        });
        function write (buf, enc, next) {
            chunks.push(buf);
            if (m.partial) showChunks(next);
            else next();
        }
        function end () {
            if (!m.partial) showChunks();
        }
        
        function showChunks (next) {
            var mstr = marked(Buffer.concat(chunks).toString());
            vhtml('<div>' + mstr + '</div>\n', function (err, dom) {
                if (err) return show(error(err));
                body = dom;
                show(render(body, hash));
                if (next) next();
            });
        }
    }
    
    function render (body, hash) {
        var href = '/task/' + encodeURIComponent(hash) + '/edit';
        return h('div', [
            h('h2', 'task'),
            h('div.right.buttons', [
                h('a', { href: href }, [
                    h('button', 'edit')
                ])
            ]),
            body
        ]);
    }
};
