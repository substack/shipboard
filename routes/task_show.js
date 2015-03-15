var h = require('virtual-dom/h');
var through = require('through2');
var vhtml = require('virtual-html');
var marked = require('marked');

module.exports = function (wiki) {
    return function (m, show) {
        if (m.partial) show(h('div', 'loading...'));
        var chunks = [], hash = '';
        var body = h('div');
        
        wiki.heads(m.params.name, function (err, heads) {
            hash = heads[0].hash; // for now...
            if (m.partial) show(render(body, hash));
            wiki.createReadStream(hash).pipe(through(write, end));
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
