var path = require('path');
var ecstatic = require('ecstatic');
var hyperstream = require('hyperstream');
var vstr = require('virtual-dom-stringify');

var fs = require('fs');
var path = require('path');
var st = ecstatic({
    root: path.join(__dirname, 'public'),
    gzip: true
});
var routes = require('./routes');
var layout = require('./lib/layout.js');

module.exports = function (wiki, bus) {
    var router = routes(wiki, bus);
    return function (req, res) {
        var m = router.match(req.url);
        if (!m) return st(req, res);
        
        m.partial = false;
        m.fn(m, function (page) {
            if (page.statusCode) res.statusCode = page.statusCode;
            res.setHeader('content-type', 'text/html');
            
            var tree = layout({
                href: req.url,
                page: page,
                route: m.route
            });
            fs.createReadStream(path.join(__dirname, 'public/index.html'))
                .pipe(hyperstream({ '#content': vstr(tree) }))
                .pipe(res)
            ;
        });
    };
};
