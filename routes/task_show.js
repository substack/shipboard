var h = require('virtual-dom/h');
var through = require('through2');
var vhtml = require('virtual-html');
var marked = require('marked');

module.exports = function (wiki) {
    return function (m, show) {
        show(h('div', 'loading...'));
        var chunks = [], hash = '';
        var body = h('div');
        
        wiki.heads(m.params.name, function (err, heads) {
            hash = heads[0].hash; // for now...
            show(render(body, hash));
            wiki.createReadStream(hash).pipe(through(write));
        });
        function write (buf, enc, next) {
            chunks.push(buf);
            var mstr = marked(Buffer.concat(chunks).toString());
            vhtml(mstr, function (err, dom) {
                body = dom;
                show(render(body, hash));
                next();
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
