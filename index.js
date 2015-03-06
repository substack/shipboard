var path = require('path');
var ecstatic = require('ecstatic');
var fs = require('fs');
var path = require('path');
var st = ecstatic({
    root: path.join(__dirname, 'public'),
    gzip: true
});

var router = require('routes')();
router.addRoute('/', function () {});
router.addRoute('/activity', function () {});
router.addRoute('/tasks', function () {});
router.addRoute('/tasks/new', function () {});
router.addRoute('/task/:hash/edit', function () {});
router.addRoute('/task/:name', function () {});

module.exports = function (req, res) {
    if (router.match(req.url)) {
        fs.createReadStream(path.join(__dirname, 'public/index.html'))
            .pipe(res)
        ;
    }
    else st(req, res);
};
