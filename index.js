var path = require('path');
var ecstatic = require('ecstatic');
var fs = require('fs');
var path = require('path');
var st = ecstatic({
    root: path.join(__dirname, 'public'),
    gzip: true
});
var routes = require('./routes');

module.exports = function (wiki, bus) {
    var router = routes(wiki, bus);
    return function (req, res) {
        if (router.match(req.url)) {
            fs.createReadStream(path.join(__dirname, 'public/index.html'))
                .pipe(res)
            ;
        }
        else st(req, res);
    };
};
